import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chat, SYSTEM_PROMPTS, type ModelId } from "@/lib/ai";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const items = await db.knowledgeItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chunks: true } } },
    });

    return NextResponse.json({
      items: items.map(i => ({
        id: i.id,
        title: i.title,
        type: i.type,
        sourceUrl: i.fileUrl,
        fileSize: i.fileSize,
        chunkCount: i._count.chunks,
        createdAt: i.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch knowledge items" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, sourceUrl, url, type, fileSize } = body;
    const finalTitle = title || url || sourceUrl || "Untitled";
    const finalUrl = sourceUrl || url || null;

    const item = await db.knowledgeItem.create({
      data: {
        userId: user.id,
        title: finalTitle,
        type: type || "TEXT",
        fileUrl: finalUrl,
        fileSize: fileSize || null,
        processed: false,
      },
    });

    return NextResponse.json({
      item: {
        id: item.id,
        title: item.title,
        type: item.type,
        sourceUrl: item.fileUrl,
        fileSize: item.fileSize,
        chunkCount: 0,
        createdAt: item.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Knowledge PUT error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { query, model = "GPT4O" } = await req.json();

    const items = await db.knowledgeItem.findMany({
      where: { userId: user.id },
      select: { title: true, type: true },
      take: 20,
    });

    const context = items.length > 0
      ? `The user has these documents in their knowledge base:\n${items.map((i, n) => `${n + 1}. ${i.title} (${i.type})`).join("\n")}`
      : "The knowledge base is currently empty.";

    const systemPrompt = SYSTEM_PROMPTS.knowledge(context);
    const response = await chat(
      [{ role: "user", content: query }],
      model as ModelId,
      systemPrompt
    );

    return NextResponse.json({
      answer: response.content,
      sources: items.slice(0, 3).map(i => i.title),
    });
  } catch (error) {
    console.error("Knowledge search error:", error);
    return NextResponse.json({ error: "Failed to search knowledge base" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.knowledgeItem.delete({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
