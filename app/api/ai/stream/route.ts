import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { openai, anthropic, gemini, type ModelId } from "@/lib/ai";
import { SYSTEM_PROMPTS } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, model = "GPT4O", systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages", { status: 400 });
    }

    const system = systemPrompt || SYSTEM_PROMPTS.assistant;

    // OpenAI / DeepSeek streaming
    if (model.startsWith("GPT") || model.startsWith("DEEPSEEK")) {
      const modelMap: Record<string, string> = {
        GPT4O: "gpt-4o",
        GPT4: "gpt-4-turbo",
        GPT4O_MINI: "gpt-4o-mini",
        DEEPSEEK_CHAT: "deepseek-chat",
      };

      const stream = await openai.chat.completions.create({
        model: modelMap[model] || "gpt-4o",
        messages: [
          { role: "system", content: system },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_tokens: 4096,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Claude streaming
    if (model.startsWith("CLAUDE")) {
      const modelMap: Record<string, string> = {
        CLAUDE3_OPUS: "claude-opus-4-8",
        CLAUDE3_SONNET: "claude-sonnet-4-6",
        CLAUDE3_HAIKU: "claude-haiku-4-5-20251001",
      };

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const stream = anthropic.messages.stream({
              model: modelMap[model] || "claude-sonnet-4-6",
              max_tokens: 4096,
              system,
              messages: messages
                .filter((m: any) => m.role !== "system")
                .map((m: any) => ({ role: m.role, content: m.content })),
            });

            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Gemini streaming
    if (model.startsWith("GEMINI")) {
      const modelMap: Record<string, string> = {
        GEMINI_PRO: "gemini-1.5-pro",
        GEMINI_FLASH: "gemini-1.5-flash",
      };

      const genModel = gemini.getGenerativeModel({
        model: modelMap[model] || "gemini-1.5-flash",
        systemInstruction: system,
      });

      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const lastMessage = messages[messages.length - 1];
      const chat = genModel.startChat({ history });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const result = await chat.sendMessageStream(lastMessage.content);
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return new Response("Unsupported model", { status: 400 });
  } catch (error) {
    console.error("Stream error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
