import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

async function requireAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireAdmin(userId);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search");
    const plan = url.searchParams.get("plan");

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: {
          ...(search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          } : {}),
          ...(plan ? { plan: plan as any } : {}),
        },
        include: {
          subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { chats: true, tasks: true, usageLogs: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({
        where: {
          ...(search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          } : {}),
          ...(plan ? { plan: plan as any } : {}),
        },
      }),
    ]);

    return NextResponse.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireAdmin(userId);

    const { id, role, plan } = await req.json();

    const user = await db.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(plan ? { plan } : {}),
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "USER_UPDATED",
        resource: "user",
        resourceId: id,
        metadata: { role, plan },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
