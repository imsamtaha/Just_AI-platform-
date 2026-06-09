import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const gemini = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || ""
);

export type ModelId =
  | "GPT4O"
  | "GPT4"
  | "GPT4O_MINI"
  | "CLAUDE3_OPUS"
  | "CLAUDE3_SONNET"
  | "CLAUDE3_HAIKU"
  | "GEMINI_PRO"
  | "GEMINI_FLASH"
  | "DEEPSEEK_CHAT";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AiResponse {
  content: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export async function chat(
  messages: ChatMessage[],
  modelId: ModelId = "GPT4O",
  systemPrompt?: string
): Promise<AiResponse> {
  const model = resolveModel(modelId);

  if (modelId.startsWith("GPT") || modelId.startsWith("DEEPSEEK")) {
    return chatWithOpenAI(messages, model, systemPrompt);
  } else if (modelId.startsWith("CLAUDE")) {
    return chatWithClaude(messages, model, systemPrompt);
  } else if (modelId.startsWith("GEMINI")) {
    return chatWithGemini(messages, model, systemPrompt);
  }

  return chatWithOpenAI(messages, "gpt-4o", systemPrompt);
}

async function chatWithOpenAI(
  messages: ChatMessage[],
  model: string,
  systemPrompt?: string
): Promise<AiResponse> {
  const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    formattedMessages.push({ role: "system", content: systemPrompt });
  }

  formattedMessages.push(
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }))
  );

  const response = await openai.chat.completions.create({
    model,
    messages: formattedMessages,
    max_tokens: 4096,
  });

  return {
    content: response.choices[0].message.content || "",
    model,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  };
}

async function chatWithClaude(
  messages: ChatMessage[],
  model: string,
  systemPrompt?: string
): Promise<AiResponse> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
  });

  const content = response.content[0];
  return {
    content: content.type === "text" ? content.text : "",
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

async function chatWithGemini(
  messages: ChatMessage[],
  model: string,
  systemPrompt?: string
): Promise<AiResponse> {
  const genModel = gemini.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = genModel.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);

  return {
    content: result.response.text(),
    model,
  };
}

function resolveModel(modelId: ModelId): string {
  const modelMap: Record<ModelId, string> = {
    GPT4O: "gpt-4o",
    GPT4: "gpt-4-turbo",
    GPT4O_MINI: "gpt-4o-mini",
    CLAUDE3_OPUS: "claude-opus-4-8",
    CLAUDE3_SONNET: "claude-sonnet-4-6",
    CLAUDE3_HAIKU: "claude-haiku-4-5-20251001",
    GEMINI_PRO: "gemini-1.5-pro",
    GEMINI_FLASH: "gemini-1.5-flash",
    DEEPSEEK_CHAT: "deepseek-chat",
  };
  return modelMap[modelId] || "gpt-4o";
}

export const SYSTEM_PROMPTS = {
  assistant: `You are SAM AI, an intelligent AI assistant. You are helpful, professional, and knowledgeable. You provide clear, accurate, and actionable responses. Format your responses with markdown when appropriate.`,

  writer: (type: string, tone: string, length: string) =>
    `You are SAM AI Writer, a professional content creation expert. Generate ${type} content with a ${tone} tone. Target length: ${length}. Format beautifully with proper structure.`,

  consultant: (type: string) =>
    `You are SAM AI Business Consultant, a senior strategic business advisor with expertise in ${type}. Provide comprehensive, professional analysis with actionable recommendations. Use structured markdown formatting with headers, bullet points, and clear sections.`,

  planner: `You are SAM AI Planner, an expert productivity coach and project manager. Help users turn goals into detailed, actionable plans with milestones, timelines, and priorities.`,

  knowledge: (context: string) =>
    `You are SAM AI Knowledge Assistant. Answer questions based on the following context from the user's knowledge base:\n\n${context}\n\nProvide accurate, helpful answers based only on the provided context. If information is not in the context, say so clearly.`,
};
