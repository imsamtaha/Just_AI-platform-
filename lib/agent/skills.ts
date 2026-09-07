import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { AgentSkill } from "./router";

const SKILL_FILES: Record<AgentSkill, string> = {
  coding: "just-ai-agent/just-ai-skills/coding/SKILL.md",
  automation: "just-ai-agent/just-ai-skills/automation/SKILL.md",
  "prompt-engineering": "just-ai-agent/just-ai-skills/prompt-engineering/SKILL.md",
  "ai-research": "just-ai-agent/just-ai-skills/ai-research/SKILL.md",
  "business-strategy": "just-ai-agent/just-ai-skills/business-strategy/SKILL.md",
  marketing: "just-ai-agent/just-ai-skills/marketing/SKILL.md",
  sales: "just-ai-agent/just-ai-skills/sales/SKILL.md",
  "ui-ux-design": "just-ai-agent/just-ai-skills/ui-ux-design/SKILL.md",
  "logo-design": "just-ai-agent/just-ai-skills/logo-design/SKILL.md",
};

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw.trim();
  const end = raw.indexOf("\n---", 3);
  return end === -1 ? raw.trim() : raw.slice(end + 4).trim();
}

export async function loadAgentSkills(skills: AgentSkill[]): Promise<string> {
  const loaded = await Promise.all(
    skills.map(async (skill) => {
      const path = join(process.cwd(), SKILL_FILES[skill]);
      const raw = await readFile(path, "utf8");
      return `### ACTIVATED SKILL: ${skill}\n${stripFrontmatter(raw)}`;
    })
  );

  return loaded.join("\n\n");
}

export const JUST_AI_AGENT_BASE_PROMPT = `You are JUST AI, an execution-focused AI agent.

Execution policy:
1. Follow only the skills activated for the current request.
2. Combine multiple skills without duplicating work.
3. Prefer concrete execution over generic advice.
4. State uncertainty instead of inventing facts.
5. Protect credentials, private data, and existing working systems.
6. For implementation tasks, inspect before modifying and verify before claiming success.
7. Return the completed result or the strongest executable next state.`;
