import "server-only";

import { chat, type ModelId } from "@/lib/ai";
import { loadAgentSkills } from "@/lib/agent/skills";

interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SpecialistResult {
  skill: string;
  content: string;
  model: string;
}

export interface OrchestrationResult {
  content: string;
  model: string;
  specialists: SpecialistResult[];
  orchestrated: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

export function shouldUseMultiAgent(skills: string[]): boolean {
  const enabled = (process.env.JUST_AI_MULTI_AGENT_ENABLED || "true").toLowerCase();
  return enabled !== "false" && skills.length > 1;
}

export async function runMultiSkillOrchestration(input: {
  messages: AgentMessage[];
  model: ModelId;
  skills: string[];
  basePrompt: string;
  toolContext?: string;
}): Promise<OrchestrationResult> {
  if (!shouldUseMultiAgent(input.skills)) {
    const skillInstructions = await loadAgentSkills(input.skills);
    const systemPrompt = [input.basePrompt, input.toolContext, skillInstructions]
      .filter(Boolean)
      .join("\n\n");
    const response = await chat(input.messages, input.model, systemPrompt);
    return {
      content: response.content,
      model: response.model,
      specialists: [],
      orchestrated: false,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    };
  }

  const latestUserMessage = [...input.messages]
    .reverse()
    .find((message) => message.role === "user")?.content;

  if (!latestUserMessage) {
    throw new Error("Multi-agent orchestration requires a user message");
  }

  const specialistResults = await Promise.all(
    input.skills.slice(0, 3).map(async (skill) => {
      const instructions = await loadAgentSkills([skill]);
      const specialistPrompt = [
        input.basePrompt,
        `You are the ${skill} specialist in a multi-agent JUST AI team. Focus only on the parts of the task that belong to your specialty. Do not duplicate other specialists. Return concise findings, decisions, or implementation guidance for the lead agent.`,
        input.toolContext,
        instructions,
      ]
        .filter(Boolean)
        .join("\n\n");

      const response = await chat(
        [{ role: "user", content: latestUserMessage }],
        input.model,
        specialistPrompt
      );

      return {
        skill,
        content: response.content,
        model: response.model,
      } satisfies SpecialistResult;
    })
  );

  const specialistContext = specialistResults
    .map((result) => `### SPECIALIST: ${result.skill}\n${result.content}`)
    .join("\n\n");

  const synthesisPrompt = [
    input.basePrompt,
    `You are the lead JUST AI agent. Synthesize the specialist outputs into one coherent answer. Resolve conflicts explicitly, remove duplication, preserve concrete implementation details, and answer the user's actual request rather than merely summarizing specialists.`,
    input.toolContext,
    specialistContext,
  ]
    .filter(Boolean)
    .join("\n\n");

  const finalResponse = await chat(input.messages, input.model, synthesisPrompt);

  return {
    content: finalResponse.content,
    model: finalResponse.model,
    specialists: specialistResults,
    orchestrated: true,
    inputTokens: finalResponse.inputTokens,
    outputTokens: finalResponse.outputTokens,
  };
}
