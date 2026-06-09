import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chat, SYSTEM_PROMPTS, type ModelId } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages, model = "GPT4O" } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const response = await chat(messages, model as ModelId, SYSTEM_PROMPTS.assistant);

    return NextResponse.json({
      content: response.content,
      model: response.model,
      tokens: (response.inputTokens || 0) + (response.outputTokens || 0),
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
