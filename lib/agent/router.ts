export const AGENT_SKILLS = [
  "coding",
  "automation",
  "prompt-engineering",
  "ai-research",
  "business-strategy",
  "marketing",
  "sales",
  "ui-ux-design",
  "logo-design",
] as const;

export type AgentSkill = (typeof AGENT_SKILLS)[number];

export interface AgentRouteDecision {
  skills: AgentSkill[];
  scores: Partial<Record<AgentSkill, number>>;
  reason: string;
}

const ALIASES: Record<string, AgentSkill | undefined> = {
  coding: "coding",
  code: "coding",
  automation: "automation",
  prompt: "prompt-engineering",
  research: "ai-research",
  strategy: "business-strategy",
  business: "business-strategy",
  marketing: "marketing",
  sales: "sales",
  design: "ui-ux-design",
  ui: "ui-ux-design",
  ux: "ui-ux-design",
  logo: "logo-design",
};

const KEYWORDS: Record<AgentSkill, string[]> = {
  coding: ["code", "coding", "bug", "debug", "python", "javascript", "typescript", "next.js", "nextjs", "react", "api", "backend", "frontend", "database", "refactor", "test", "github", "repository", "repo", "implement", "build"],
  automation: ["automation", "automate", "workflow", "n8n", "make.com", "zapier", "webhook", "integration", "integrate", "trigger", "crm", "agent workflow"],
  "prompt-engineering": ["prompt", "system prompt", "developer prompt", "prompt engineering", "instructions", "agent prompt", "optimize prompt"],
  "ai-research": ["research", "compare", "study", "investigate", "latest", "sources", "paper", "framework", "benchmark", "market research"],
  "business-strategy": ["strategy", "business model", "go to market", "gtm", "positioning", "pricing", "roadmap", "opportunity", "prioritize", "business plan"],
  marketing: ["marketing", "campaign", "content", "launch", "brand messaging", "funnel", "linkedin", "social media", "growth", "acquisition"],
  sales: ["sales", "prospect", "lead", "outreach", "follow-up", "follow up", "proposal", "objection", "pipeline", "qualification", "client"],
  "ui-ux-design": ["ui", "ux", "dashboard", "interface", "wireframe", "design system", "responsive", "accessibility", "user flow", "layout"],
  "logo-design": ["logo", "wordmark", "monogram", "visual identity", "brand mark", "logo design", "emblem"],
};

export function routeAgentSkills(input: string, maxSkills = 3): AgentRouteDecision {
  const text = input.toLowerCase().trim();
  const explicit: AgentSkill[] = [];

  for (const match of text.matchAll(/\/([a-z0-9_-]+)/g)) {
    const skill = ALIASES[match[1]];
    if (skill && !explicit.includes(skill)) explicit.push(skill);
  }

  if (explicit.length > 0) {
    const skills = explicit.slice(0, maxSkills);
    return {
      skills,
      scores: Object.fromEntries(skills.map((skill) => [skill, 1])) as Partial<Record<AgentSkill, number>>,
      reason: "Explicit skill command(s) detected.",
    };
  }

  const scores: Partial<Record<AgentSkill, number>> = {};
  for (const skill of AGENT_SKILLS) {
    let score = 0;
    for (const term of KEYWORDS[skill]) {
      if (text.includes(term)) score += term.includes(" ") ? 1.5 : 1;
    }
    if (score > 0) scores[skill] = score;
  }

  const skills = AGENT_SKILLS
    .filter((skill) => scores[skill] !== undefined)
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
    .slice(0, maxSkills);

  if (skills.length === 0) {
    const fallback: AgentSkill = /\b(build|create|implement|fix)\b/.test(text)
      ? "coding"
      : "prompt-engineering";
    return { skills: [fallback], scores: { [fallback]: 0.1 }, reason: "No strong match; used conservative fallback." };
  }

  return { skills, scores, reason: "Skills selected by weighted keyword matching." };
}
