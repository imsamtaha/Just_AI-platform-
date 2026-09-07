import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { chat, type ModelId } from "@/lib/ai";
import { AgentPersistence } from "@/lib/agent/persistence";
import { routeAgentSkills } from "@/lib/agent/router";
import { JUST_AI_AGENT_BASE_PROMPT, loadAgentSkills } from "@/lib/agent/skills";

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

    // User-supplied system messages are excluded. JUST AI owns the execution policy.
    const messages = parsed.data.messages.filter((message) => message.role !== "system");
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      return NextResponse.json({ error: "A user message is required" }, { status: 400 });
    }

    const route = routeAgentSkills(latestUserMessage.content);
    const skillInstructions = await loadAgentSkills(route.skills);
    const systemPrompt = `${JUST_AI_AGENT_BASE_PROMPT}\n\nROUTING DECISION:\n${route.reason}\nSelected skills: ${route.skills.join(", ")}\n\n${skillInstructions}`;

    const startedAt = Date.now();
    const response = await chat(messages, model, systemPrompt);
    const latencyMs = Date.now() - startedAt;

    let sessionId = parsed.data.sessionId;
    let executionId: string | null = null;
    let persisted = false;

    try {
      const accessToken = await getToken();
      const persistence = accessToken
        ? AgentPersistence.fromEnv(accessToken, userId)
        : null;

      if (persistence) {
        sessionId = sessionId || (await persistence.createSession(latestUserMessage.content));
        executionId = await persistence.recordExecution({
          sessionId,
          prompt: latestUserMessage.content,
          output: response.content,
          selectedSkills: route.skills,
          validation: { ok: true, routing: route.reason },
          model: response.model,
          latencyMs,
        });
        await persistence.recordSkillUsage(executionId, route.skills);
        persisted = true;
      }
    } catch (persistenceError) {
      console.error("JUST AI persistence error:", persistenceError);
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
    });
  } catch (error) {
    console.error("JUST AI agent API error:", error);
    return NextResponse.json(
      { error: "Failed to process JUST AI agent request" },
      { status: 500 }
    );
  }
}
