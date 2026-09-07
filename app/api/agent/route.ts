import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { type ModelId } from "@/lib/ai";
import { externalTools } from "@/lib/agent/external-tools";
import { runMultiSkillOrchestration } from "@/lib/agent/orchestrator";
import { AgentPersistence } from "@/lib/agent/persistence";
import { routeAgentSkills } from "@/lib/agent/router";
import { JUST_AI_AGENT_BASE_PROMPT } from "@/lib/agent/skills";
import { planExternalTool } from "@/lib/agent/tool-planner";
import { buildAgentToolContext } from "@/lib/agent/tools";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(30000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  model: z.string().optional().default("GPT4O"),
  sessionId: z.string().uuid().optional(),
});

const ALLOWED_MODELS = new Set<ModelId>([
  "GPT4O",
  "GPT4",
  "GPT4O_MINI",
  "CLAUDE3_OPUS",
  "CLAUDE3_SONNET",
  "CLAUDE3_HAIKU",
  "GEMINI_PRO",
  "GEMINI_FLASH",
  "DEEPSEEK_CHAT",
]);

export async function POST(request: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const model = parsed.data.model as ModelId;
    if (!ALLOWED_MODELS.has(model)) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
    }

    const messages = parsed.data.messages.filter((message) => message.role !== "system");
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      return NextResponse.json({ error: "A user message is required" }, { status: 400 });
    }

    const route = routeAgentSkills(latestUserMessage.content);

    const accessToken = await getToken();
    const persistence = accessToken
      ? AgentPersistence.fromEnv(accessToken, userId)
      : null;

    let sessionId = parsed.data.sessionId;
    if (persistence && !sessionId) {
      try {
        sessionId = await persistence.createSession(latestUserMessage.content);
      } catch (sessionError) {
        console.error("JUST AI session persistence error:", sessionError);
      }
    }

    const toolContext = await buildAgentToolContext({
      message: latestUserMessage.content,
      persistence,
      sessionId,
    });

    let toolAction: null | {
      status: "pending" | "executed";
      requestId?: string;
      tool: string;
      risk: "read" | "write" | "consequential";
      reason: string;
      input: Record<string, unknown>;
      output?: unknown;
    } = null;

    if (persistence && sessionId) {
      try {
        const plan = await planExternalTool({
          message: latestUserMessage.content,
          model,
        });

        if (plan) {
          const tool = externalTools.get(plan.tool);
          if (tool && tool.enabled()) {
            if (tool.risk === "read") {
              const output = await externalTools.execute(tool.name, plan.input, {
                userId,
                sessionId,
                persistence,
              });
              toolAction = {
                status: "executed",
                tool: tool.name,
                risk: tool.risk,
                reason: plan.reason,
                input: plan.input,
                output,
              };
            } else {
              const requestId = await persistence.createToolRequest({
                sessionId,
                toolName: tool.name,
                risk: tool.risk,
                payload: plan.input,
              });
              toolAction = {
                status: "pending",
                requestId,
                tool: tool.name,
                risk: tool.risk,
                reason: plan.reason,
                input: plan.input,
              };
            }
          }
        }
      } catch (plannerError) {
        console.error("JUST AI external tool planner error:", plannerError);
      }
    }

    const actionPrompt = toolAction
      ? `\n\nEXTERNAL TOOL ACTION:\n${JSON.stringify(toolAction).slice(0, 8000)}\nIf status is pending, clearly tell the user the action is awaiting their approval and do not claim it executed. If status is executed, you may summarize the result.`
      : "";

    const routingPrompt = `${JUST_AI_AGENT_BASE_PROMPT}\n\nROUTING DECISION:\n${route.reason}\nSelected skills: ${route.skills.join(", ")}${actionPrompt}`;

    const startedAt = Date.now();
    const response = await runMultiSkillOrchestration({
      messages,
      model,
      skills: route.skills,
      basePrompt: routingPrompt,
      toolContext: toolContext.promptContext,
    });
    const latencyMs = Date.now() - startedAt;

    let executionId: string | null = null;
    let persisted = false;

    if (persistence && sessionId) {
      try {
        executionId = await persistence.recordExecution({
          sessionId,
          prompt: latestUserMessage.content,
          output: response.content,
          selectedSkills: route.skills,
          validation: {
            ok: true,
            routing: route.reason,
            orchestrated: response.orchestrated,
            tools: toolContext.results.map(({ tool, ok, error }) => ({ tool, ok, error })),
            externalTool: toolAction
              ? { tool: toolAction.tool, risk: toolAction.risk, status: toolAction.status }
              : null,
          },
          model: response.model,
          latencyMs,
        });
        await persistence.recordSkillUsage(executionId, route.skills);
        persisted = true;
      } catch (persistenceError) {
        console.error("JUST AI persistence error:", persistenceError);
      }
    }

    return NextResponse.json({
      content: response.content,
      model: response.model,
      tokens: (response.inputTokens || 0) + (response.outputTokens || 0),
      selectedSkills: route.skills,
      routingReason: route.reason,
      sessionId: sessionId || null,
      executionId,
      persisted,
      latencyMs,
      orchestrated: response.orchestrated,
      specialists: response.specialists.map((specialist) => ({
        skill: specialist.skill,
        model: specialist.model,
      })),
      tools: toolContext.results.map(({ tool, ok, error }) => ({ tool, ok, error })),
      toolAction,
    });
  } catch (error) {
    console.error("JUST AI agent API error:", error);
    return NextResponse.json(
      { error: "Failed to process JUST AI agent request" },
      { status: 500 }
    );
  }
}
