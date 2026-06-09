import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chat, SYSTEM_PROMPTS, type ModelId } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, prompt, tone = "Professional", length = "Medium", model = "GPT4O" } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS.writer(type, tone, length);
    const userMessage = `Write the following ${type}: ${prompt}`;

    const response = await chat(
      [{ role: "user", content: userMessage }],
      model as ModelId,
      systemPrompt
    );

    return NextResponse.json({ content: response.content, model: response.model });
  } catch (error) {
    console.error("Writer API error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
