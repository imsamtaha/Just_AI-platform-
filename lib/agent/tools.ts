import "server-only";

import type { AgentPersistence } from "@/lib/agent/persistence";

export type AgentToolRisk = "read" | "write" | "consequential";

export interface AgentToolContext {
  persistence: AgentPersistence | null;
  sessionId?: string;
}

export interface AgentToolResult {
  tool: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface AgentToolDefinition<TInput = unknown> {
  name: string;
  description: string;
  risk: AgentToolRisk;
  requiresPersistence?: boolean;
  execute: (input: TInput, context: AgentToolContext) => Promise<unknown>;
}

export class AgentToolRegistry {
  private readonly tools = new Map<string, AgentToolDefinition>();

  register(tool: AgentToolDefinition): this {
    if (this.tools.has(tool.name)) {
      throw new Error(`Agent tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
    return this;
  }

  list(): Array<Pick<AgentToolDefinition, "name" | "description" | "risk">> {
    return [...this.tools.values()].map(({ name, description, risk }) => ({
      name,
      description,
      risk,
    }));
  }

  async execute(
    name: string,
    input: unknown,
    context: AgentToolContext,
    options: { allowWrites?: boolean } = {}
  ): Promise<AgentToolResult> {
    const tool = this.tools.get(name);
    if (!tool) return { tool: name, ok: false, error: "Unknown tool" };

    if (tool.risk !== "read" && !options.allowWrites) {
      return { tool: name, ok: false, error: "Tool requires explicit write permission" };
    }

    if (tool.requiresPersistence && !context.persistence) {
      return { tool: name, ok: false, error: "Persistence is unavailable" };
    }

    try {
      const data = await tool.execute(input, context);
      return { tool: name, ok: true, data };
    } catch (error) {
      return {
        tool: name,
        ok: false,
        error: error instanceof Error ? error.message : "Tool execution failed",
      };
    }
  }
}

export const agentTools = new AgentToolRegistry()
  .register({
    name: "memory.recent",
    description: "Load the authenticated user's most recent JUST AI memories.",
    risk: "read",
    requiresPersistence: true,
    async execute(input, context) {
      const limit = Math.min(
        12,
        Math.max(1, Number((input as { limit?: number } | null)?.limit || 6))
      );
      return context.persistence!.getRecentMemories(limit, context.sessionId);
    },
  })
  .register({
    name: "session.recent-executions",
    description: "Load recent agent executions for the current authenticated session.",
    risk: "read",
    requiresPersistence: true,
    async execute(input, context) {
      if (!context.sessionId) return [];
      const limit = Math.min(
        10,
        Math.max(1, Number((input as { limit?: number } | null)?.limit || 4))
      );
      return context.persistence!.getRecentExecutions(context.sessionId, limit);
    },
  })
  .register({
    name: "skills.catalog",
    description: "Return the built-in JUST AI skill catalog.",
    risk: "read",
    async execute() {
      return [
        "coding",
        "automation",
        "prompt-engineering",
        "ai-research",
        "business-strategy",
        "marketing",
        "sales",
        "ui-ux-design",
        "logo-design",
      ];
    },
  });

export async function buildAgentToolContext(input: {
  message: string;
  persistence: AgentPersistence | null;
  sessionId?: string;
}): Promise<{ results: AgentToolResult[]; promptContext: string }> {
  const results: AgentToolResult[] = [];
  const context: AgentToolContext = {
    persistence: input.persistence,
    sessionId: input.sessionId,
  };

  if (input.persistence) {
    results.push(await agentTools.execute("memory.recent", { limit: 6 }, context));

    if (input.sessionId) {
      results.push(
        await agentTools.execute("session.recent-executions", { limit: 4 }, context)
      );
    }
  }

  const successful = results.filter((result) => result.ok && result.data);
  if (!successful.length) return { results, promptContext: "" };

  const promptContext = successful
    .map(
      (result) =>
        `### TOOL CONTEXT: ${result.tool}\n${JSON.stringify(result.data).slice(0, 12000)}`
    )
    .join("\n\n");

  return { results, promptContext };
}
