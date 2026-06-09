import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chat, SYSTEM_PROMPTS, type ModelId } from "@/lib/ai";

const analysisPrompts: Record<string, string> = {
  swot: "Provide a comprehensive SWOT Analysis with detailed Strengths, Weaknesses, Opportunities, and Threats. Include strategic recommendations for each quadrant.",
  market: "Conduct a thorough Market Analysis including market size, target segments, trends, growth opportunities, and market entry strategies.",
  competitor: "Perform a detailed Competitor Research analysis including competitive landscape, key players, their strengths/weaknesses, and how to differentiate.",
  startup: "Validate this startup idea with a comprehensive analysis including problem/solution fit, market validation, business model viability, risks, and a go-to-market strategy.",
  revenue: "Create a detailed Revenue Planning document including revenue models, pricing strategies, revenue streams, financial projections, and growth levers.",
  sales: "Develop a comprehensive Sales Strategy including target customer profiles, sales process, objection handling, KPIs, and a 90-day sales playbook.",
  roadmap: "Create a strategic Business Roadmap with quarterly milestones, key initiatives, resource requirements, success metrics, and risk mitigation plans.",
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, businessInfo, model = "GPT4O" } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS.consultant(type);
    const analysisInstruction = analysisPrompts[type] || "Provide strategic business analysis.";
    const userMessage = `${analysisInstruction}\n\nBusiness Information:\n${businessInfo}`;

    const response = await chat(
      [{ role: "user", content: userMessage }],
      model as ModelId,
      systemPrompt
    );

    return NextResponse.json({ content: response.content, model: response.model });
  } catch (error) {
    console.error("Consultant API error:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
