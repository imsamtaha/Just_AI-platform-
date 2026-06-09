import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          imageUrl: clerkUser.imageUrl,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const user = await db.user.update({
      where: { clerkId: userId },
      data: { name: data.name },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
