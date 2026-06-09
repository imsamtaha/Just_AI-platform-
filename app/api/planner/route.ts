import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chat, SYSTEM_PROMPTS, type ModelId } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { goalTitle, description, dueDate, model = "GPT4O" } = await req.json();

    const userMessage = `Create a detailed action plan for this goal:

Goal: ${goalTitle}
${description ? `Description: ${description}` : ""}
${dueDate ? `Due Date: ${dueDate}` : ""}

Provide:
1. A strategic overview
2. 4-6 key milestones with dates
3. Specific daily/weekly tasks
4. Potential obstacles and solutions
5. Success metrics

Format as a professional, actionable plan.`;

    const response = await chat(
      [{ role: "user", content: userMessage }],
      model as ModelId,
      SYSTEM_PROMPTS.planner
    );

    return NextResponse.json({ content: response.content, model: response.model });
  } catch (error) {
    console.error("Planner API error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
