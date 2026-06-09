import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const dealSchema = z.object({
  title: z.string().min(1),
  value: z.number().default(0),
  currency: z.string().default("USD"),
  status: z.enum(["OPEN", "WON", "LOST", "ON_HOLD"]).default("OPEN"),
  stage: z.string().optional(),
  probability: z.number().min(0).max(100).default(0),
  contactId: z.string().optional(),
  pipelineId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const deals = await db.deal.findMany({
      where: { userId: user.id },
      include: {
        contact: { select: { firstName: true, lastName: true, company: true } },
        pipeline: { select: { name: true, stages: true } },
      },
      orderBy: { value: "desc" },
    });

    return NextResponse.json(deals);
  } catch {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const data = dealSchema.parse(body);

    const deal = await db.deal.create({
      data: { userId: user.id, ...data },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
