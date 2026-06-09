import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const folderId = url.searchParams.get("folderId");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const chats = await db.chat.findMany({
      where: { userId: user.id, ...(folderId ? { folderId } : {}) },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      take: limit,
    });

    return NextResponse.json(chats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { title, model, folderId } = await req.json();

    const chat = await db.chat.create({
      data: {
        userId: user.id,
        title: title || "New Chat",
        model: model || "GPT4O",
        folderId: folderId || null,
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id, title, pinned, folderId } = await req.json();

    const chat = await db.chat.update({
      where: { id, userId: user.id },
      data: {
        ...(title !== undefined && { title }),
        ...(pinned !== undefined && { pinned }),
        ...(folderId !== undefined && { folderId }),
      },
    });

    return NextResponse.json(chat);
  } catch {
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "Chat ID required" }, { status: 400 });

    await db.chat.delete({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
