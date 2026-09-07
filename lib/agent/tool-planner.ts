import "server-only";

import { chat, type ModelId } from "@/lib/ai";
import { externalTools } from "@/lib/agent/external-tools";

export interface PlannedExternalTool {
  tool: string;
  input: Record<string, unknown>;
  reason: string;
}

function looksLikeActionRequest(message: string): boolean {
  const text = message.toLowerCase();
  const actionTerms = [
    "create", "open", "add", "schedule", "book", "send", "run", "trigger",
    "start", "make", "log", "save", "post", "publish", "update"
  ];
  const connectorTerms = [
    "github", "issue", "calendar", "meeting", "event", "crm", "contact", "workflow", "automation"
  ];
  return actionTerms.some((term) => text.includes(term)) && connectorTerms.some((term) => text.includes(term));
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] || text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function planExternalTool(input: {
  message: string;
  model: ModelId;
}): Promise<PlannedExternalTool | null> {
  if (process.env.JUST_AI_TOOL_PLANNER_ENABLED === "false") return null;
  if (!looksLikeActionRequest(input.message)) return null;

  const tools = externalTools.list().filter((tool) => tool.enabled);
  if (!tools.length) return null;

  const systemPrompt = `You are the JUST AI external-tool planner.\n\nReturn ONLY JSON. Never execute anything.\nChoose a tool only when the user clearly requests a real action now.\nDo not choose a tool for hypothetical questions, explanations, brainstorming, or examples.\nOnly choose from the enabled tools below.\nIf required input is missing, return {"tool":null}.\n\nEnabled tools:\n${tools
    .map((tool) => `- ${tool.name} [${tool.risk}]: ${tool.description}`)
    .join("\n")}\n\nExpected JSON schema:\n{"tool":"tool.name"|null,"input":{},"reason":"short explanation"}`;

  const result = await chat(
    [{ role: "user", content: input.message }],
    input.model,
    systemPrompt
  );

  const parsed = extractJson(result.content) as {
    tool?: unknown;
    input?: unknown;
    reason?: unknown;
  } | null;

  if (!parsed || typeof parsed.tool !== "string" || !parsed.tool) return null;
  const tool = externalTools.get(parsed.tool);
  if (!tool || !tool.enabled()) return null;

  return {
    tool: parsed.tool,
    input:
      parsed.input && typeof parsed.input === "object" && !Array.isArray(parsed.input)
        ? (parsed.input as Record<string, unknown>)
        : {},
    reason:
      typeof parsed.reason === "string"
        ? parsed.reason.slice(0, 500)
        : "User requested an external action.",
  };
}
