import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { chatId } = await params;

    const chat = await db.chat.findFirst({
      where: { id: chatId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return NextResponse.json(chat);
  } catch {
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { chatId } = await params;
    const { role, content, model, tokens } = await req.json();

    const chat = await db.chat.findFirst({
      where: { id: chatId, userId: user.id },
    });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const message = await db.message.create({
      data: {
        chatId,
        userId: user.id,
        role: role.toUpperCase() as "USER" | "ASSISTANT" | "SYSTEM",
        content,
        model: model || null,
        tokens: tokens || null,
      },
    });

    // Update chat's updatedAt
    await db.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
