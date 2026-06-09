import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chat, SYSTEM_PROMPTS, type ModelId } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { query, model = "GPT4O" } = await req.json();

    const mockContext = `
      The user has the following documents in their knowledge base:
      1. Product Strategy 2024 - Describes the roadmap for SAM AI platform
      2. Market Research Report - Analysis of AI productivity tools market
      3. Competitor Analysis - Comparison with ChatGPT, Notion AI, ClickUp
    `;

    const systemPrompt = SYSTEM_PROMPTS.knowledge(mockContext);

    const response = await chat(
      [{ role: "user", content: query }],
      model as ModelId,
      systemPrompt
    );

    return NextResponse.json({
      answer: response.content,
      sources: ["Product Strategy 2024", "Market Research Report"],
    });
  } catch (error) {
    console.error("Knowledge API error:", error);
    return NextResponse.json({ error: "Failed to search knowledge base" }, { status: 500 });
  }
}
