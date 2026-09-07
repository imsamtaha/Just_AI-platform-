import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { externalTools } from "@/lib/agent/external-tools";
import { AgentPersistence } from "@/lib/agent/persistence";

export const runtime = "nodejs";

const executeSchema = z.object({
  tool: z.string().min(1).max(120),
  input: z.record(z.unknown()).default({}),
  sessionId: z.string().uuid().optional(),
});

async function getContext() {
  const { userId, getToken } = await auth();
  if (!userId) return null;
  const accessToken = await getToken();
  if (!accessToken) return null;
  const persistence = AgentPersistence.fromEnv(accessToken, userId);
  if (!persistence) return null;
  return { userId, persistence };
}

export async function GET() {
  const context = await getContext();
  if (!context) return NextResponse.json({ error: "Unauthorized or persistence unavailable" }, { status: 401 });

  const pending = await context.persistence.listPendingToolRequests(20);
  return NextResponse.json({
    tools: externalTools.list(),
    pendingRequests: pending,
  });
}

export async function POST(request: Request) {
  try {
    const context = await getContext();
    if (!context) return NextResponse.json({ error: "Unauthorized or persistence unavailable" }, { status: 401 });

    const parsed = executeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tool request", details: parsed.error.flatten() }, { status: 400 });
    }

    const tool = externalTools.get(parsed.data.tool);
    if (!tool) return NextResponse.json({ error: "Unknown external tool" }, { status: 404 });
    if (!tool.enabled()) return NextResponse.json({ error: "External tool is not configured" }, { status: 503 });

    const toolContext = {
      userId: context.userId,
      sessionId: parsed.data.sessionId,
      persistence: context.persistence,
    };

    if (tool.risk === "read") {
      const output = await externalTools.execute(tool.name, parsed.data.input, toolContext);
      return NextResponse.json({
        status: "executed",
        tool: tool.name,
        risk: tool.risk,
        output,
        approvalRequired: false,
      });
    }

    const requestId = await context.persistence.createToolRequest({
      sessionId: parsed.data.sessionId,
      toolName: tool.name,
      risk: tool.risk,
      payload: parsed.data.input,
    });

    return NextResponse.json(
      {
        status: "pending",
        requestId,
        tool: tool.name,
        risk: tool.risk,
        approvalRequired: true,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("JUST AI external tool planning error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "External tool request failed" },
      { status: 500 }
    );
  }
}
