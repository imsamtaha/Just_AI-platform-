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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalTasks,
      dueTodayTasks,
      activeProjects,
      completedProjects,
      goals,
      chatsThisWeek,
      totalChatsThisMonth,
      activeLeads,
      hotLeads,
      recentChats,
      recentTasks,
    ] = await Promise.all([
      db.task.count({ where: { userId: user.id } }),
      db.task.count({
        where: {
          userId: user.id,
          status: { not: "DONE" },
          dueDate: { gte: todayStart, lt: new Date(todayStart.getTime() + 86400000) },
        },
      }),
      db.project.count({ where: { userId: user.id, status: "ACTIVE" } }),
      db.project.count({ where: { userId: user.id, status: "COMPLETED" } }),
      db.goal.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        select: { progress: true },
      }),
      db.chat.count({ where: { userId: user.id, createdAt: { gte: sevenDaysAgo } } }),
      db.chat.count({ where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } } }),
      db.lead.count({ where: { userId: user.id, status: { not: "LOST" } } }),
      db.lead.count({ where: { userId: user.id, status: "QUALIFIED" } }),
      db.chat.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: { id: true, title: true, model: true, updatedAt: true },
      }),
      db.task.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: { id: true, title: true, status: true, priority: true },
      }),
    ]);

    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;

    // Rough usage percentage based on chats this month (100 chats = 100%)
    const chatUsagePct = Math.min(100, Math.round((totalChatsThisMonth / 100) * 100));

    return NextResponse.json({
      stats: {
        totalTasks,
        dueTodayTasks,
        activeProjects,
        completedProjects,
        activeGoals: goals.length,
        avgGoalProgress,
        totalChatsThisWeek: chatsThisWeek,
        chatUsagePct,
        activeLeads,
        hotLeads,
      },
      recentChats: recentChats.map(c => ({
        id: c.id,
        title: c.title,
        model: c.model,
        updatedAt: c.updatedAt.toISOString(),
      })),
      recentTasks: recentTasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status.toLowerCase().replace("_", "-"),
        priority: t.priority.toLowerCase(),
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
