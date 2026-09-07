import "server-only";

import type { AgentPersistence } from "@/lib/agent/persistence";

export type ExternalToolRisk = "read" | "write" | "consequential";

export interface ExternalToolContext {
  userId: string;
  sessionId?: string;
  persistence: AgentPersistence;
}

export interface ExternalToolDefinition {
  name: string;
  description: string;
  risk: ExternalToolRisk;
  enabled: () => boolean;
  execute: (input: Record<string, unknown>, context: ExternalToolContext) => Promise<unknown>;
}

function getAllowedRepos(): Set<string> {
  const raw = process.env.JUST_AI_GITHUB_ALLOWED_REPOS || "imsamtaha/Just_AI-platform-";
  return new Set(raw.split(",").map((value) => value.trim()).filter(Boolean));
}

async function githubRequest(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(init.headers as Record<string, string> | undefined),
  };
  const token = process.env.GITHUB_AGENT_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function callFixedWebhook(
  url: string | undefined,
  secret: string | undefined,
  tool: string,
  input: Record<string, unknown>,
  context: ExternalToolContext
) {
  if (!url) throw new Error(`${tool} connector is not configured`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({
      tool,
      userId: context.userId,
      sessionId: context.sessionId || null,
      input,
    }),
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${tool} connector failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : { ok: true };
}

const definitions: ExternalToolDefinition[] = [
  {
    name: "github.repo.summary",
    description: "Read metadata for an allow-listed GitHub repository.",
    risk: "read",
    enabled: () => true,
    async execute(input) {
      const repo = String(input.repo || "").trim();
      if (!repo || !getAllowedRepos().has(repo)) throw new Error("Repository is not allow-listed");
      const data = await githubRequest(`/repos/${repo}`);
      return {
        full_name: data.full_name,
        description: data.description,
        default_branch: data.default_branch,
        visibility: data.visibility,
        open_issues_count: data.open_issues_count,
        pushed_at: data.pushed_at,
      };
    },
  },
  {
    name: "github.issue.create",
    description: "Create an issue in an allow-listed GitHub repository after explicit approval.",
    risk: "write",
    enabled: () => Boolean(process.env.GITHUB_AGENT_TOKEN),
    async execute(input) {
      const repo = String(input.repo || "").trim();
      const title = String(input.title || "").trim();
      const body = String(input.body || "").slice(0, 20000);
      if (!repo || !getAllowedRepos().has(repo)) throw new Error("Repository is not allow-listed");
      if (!title) throw new Error("Issue title is required");
      const data = await githubRequest(`/repos/${repo}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      return { number: data.number, html_url: data.html_url, title: data.title };
    },
  },
  {
    name: "calendar.event.create",
    description: "Create a calendar event through the configured server-side connector after approval.",
    risk: "write",
    enabled: () => Boolean(process.env.JUST_AI_CALENDAR_CONNECTOR_URL),
    execute: (input, context) =>
      callFixedWebhook(
        process.env.JUST_AI_CALENDAR_CONNECTOR_URL,
        process.env.JUST_AI_CONNECTOR_SECRET,
        "calendar.event.create",
        input,
        context
      ),
  },
  {
    name: "crm.contact.create",
    description: "Create a CRM contact through the configured server-side connector after approval.",
    risk: "write",
    enabled: () => Boolean(process.env.JUST_AI_CRM_CONNECTOR_URL),
    execute: (input, context) =>
      callFixedWebhook(
        process.env.JUST_AI_CRM_CONNECTOR_URL,
        process.env.JUST_AI_CONNECTOR_SECRET,
        "crm.contact.create",
        input,
        context
      ),
  },
  {
    name: "automation.workflow.run",
    description: "Trigger the configured automation workflow after explicit approval.",
    risk: "consequential",
    enabled: () => Boolean(process.env.JUST_AI_AUTOMATION_CONNECTOR_URL),
    execute: (input, context) =>
      callFixedWebhook(
        process.env.JUST_AI_AUTOMATION_CONNECTOR_URL,
        process.env.JUST_AI_CONNECTOR_SECRET,
        "automation.workflow.run",
        input,
        context
      ),
  },
];

export class ExternalToolRegistry {
  private readonly map = new Map(definitions.map((tool) => [tool.name, tool]));

  list() {
    return definitions.map(({ name, description, risk, enabled }) => ({
      name,
      description,
      risk,
      enabled: enabled(),
    }));
  }

  get(name: string): ExternalToolDefinition | null {
    return this.map.get(name) || null;
  }

  async execute(
    name: string,
    input: Record<string, unknown>,
    context: ExternalToolContext
  ): Promise<unknown> {
    const tool = this.get(name);
    if (!tool) throw new Error("Unknown external tool");
    if (!tool.enabled()) throw new Error("External tool is not configured");
    return tool.execute(input, context);
  }
}

export const externalTools = new ExternalToolRegistry();
