import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalChats,
      totalTasks,
      completedTasks,
      activeGoals,
      totalAiGenerations,
      weeklyUsage,
      recentChats,
    ] = await Promise.all([
      db.chat.count({ where: { userId: user.id } }),
      db.task.count({ where: { userId: user.id } }),
      db.task.count({ where: { userId: user.id, status: "DONE" } }),
      db.goal.count({ where: { userId: user.id, status: "ACTIVE" } }),
      db.aiGeneration.count({ where: { userId: user.id } }),
      db.usageLog.findMany({
        where: { userId: user.id, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
      }),
      db.chat.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, model: true, updatedAt: true },
      }),
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalChats,
        totalTasks,
        completedTasks,
        activeGoals,
        totalAiGenerations,
        taskCompletionRate,
      },
      weeklyUsage,
      recentChats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
