import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { externalTools } from "@/lib/agent/external-tools";
import { AgentPersistence } from "@/lib/agent/persistence";

export const runtime = "nodejs";

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().max(1000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = await getToken();
    const persistence = accessToken ? AgentPersistence.fromEnv(accessToken, userId) : null;
    if (!persistence) {
      return NextResponse.json({ error: "Persistence unavailable" }, { status: 503 });
    }

    const parsed = decisionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid decision", details: parsed.error.flatten() }, { status: 400 });
    }

    const { id } = await params;
    const toolRequest = await persistence.getToolRequest(id);
    if (!toolRequest) return NextResponse.json({ error: "Tool request not found" }, { status: 404 });
    if (toolRequest.status !== "pending") {
      return NextResponse.json(
        { error: `Tool request is already ${toolRequest.status}` },
        { status: 409 }
      );
    }

    if (parsed.data.decision === "reject") {
      const rejected = await persistence.updateToolRequest(id, {
        status: "rejected",
        approval_note: parsed.data.note || null,
        rejected_at: new Date().toISOString(),
      });
      return NextResponse.json({ status: "rejected", request: rejected });
    }

    const tool = externalTools.get(toolRequest.tool_name);
    if (!tool) {
      await persistence.updateToolRequest(id, {
        status: "failed",
        error: "External tool definition is no longer available",
      });
      return NextResponse.json({ error: "External tool unavailable" }, { status: 410 });
    }
    if (!tool.enabled()) {
      return NextResponse.json({ error: "External tool is not configured" }, { status: 503 });
    }

    await persistence.updateToolRequest(id, {
      status: "approved",
      approval_note: parsed.data.note || null,
      approved_at: new Date().toISOString(),
    });
    await persistence.updateToolRequest(id, { status: "executing" });

    try {
      const output = await externalTools.execute(
        toolRequest.tool_name,
        toolRequest.input || {},
        {
          userId,
          sessionId: toolRequest.session_id || undefined,
          persistence,
        }
      );

      const executed = await persistence.updateToolRequest(id, {
        status: "executed",
        output,
        error: null,
        executed_at: new Date().toISOString(),
      });
      return NextResponse.json({ status: "executed", request: executed });
    } catch (executionError) {
      const message = executionError instanceof Error ? executionError.message : "Tool execution failed";
      await persistence.updateToolRequest(id, {
        status: "failed",
        error: message,
      });
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    console.error("JUST AI tool approval error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tool approval failed" },
      { status: 500 }
    );
  }
}
