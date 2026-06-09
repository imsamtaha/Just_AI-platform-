import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisWeek,
      newUsersThisMonth,
      proUsers,
      businessUsers,
      totalChats,
      chatsToday,
      activeSubscriptions,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: thisWeek } } }),
      db.user.count({ where: { createdAt: { gte: thisMonth } } }),
      db.user.count({ where: { plan: "PRO" } }),
      db.user.count({ where: { plan: "BUSINESS" } }),
      db.chat.count(),
      db.chat.count({ where: { createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) } } }),
      db.subscription.count({ where: { status: "ACTIVE" } }),
    ]);

    const estimatedMRR = proUsers * 29 + businessUsers * 99;

    return NextResponse.json({
      users: { total: totalUsers, newThisWeek: newUsersThisWeek, newThisMonth: newUsersThisMonth },
      subscriptions: { active: activeSubscriptions, pro: proUsers, business: businessUsers },
      ai: { totalChats, chatsToday },
      revenue: { mrr: estimatedMRR },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
