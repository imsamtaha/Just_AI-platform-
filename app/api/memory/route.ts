import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const memorySchema = z.object({
  type: z.enum(["PREFERENCE", "WRITING_STYLE", "INSTRUCTION", "BUSINESS_INFO", "SAVED_PROMPT", "FACT"]),
  key: z.string().min(1),
  value: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const memories = await db.userMemory.findMany({
      where: {
        userId: user.id,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(memories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const data = memorySchema.parse(body);

    const existing = await db.userMemory.findFirst({
      where: { userId: user.id, key: data.key },
    });

    const memory = existing
      ? await db.userMemory.update({
          where: { id: existing.id },
          data: { value: data.value, type: data.type },
        })
      : await db.userMemory.create({
          data: { userId: user.id, ...data, embedding: [] },
        });

    return NextResponse.json(memory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Memory ID required" }, { status: 400 });

    await db.userMemory.delete({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
