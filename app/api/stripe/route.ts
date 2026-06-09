import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckoutSession, createBillingPortal, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, plan } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (action === "checkout") {
      const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
      if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const session = await createCheckoutSession({
        userId,
        email: "",
        priceId: planConfig.priceId,
        successUrl: `${appUrl}/dashboard?success=true`,
        cancelUrl: `${appUrl}/settings?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    }

    if (action === "portal") {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Stripe API error:", error);
    return NextResponse.json({ error: "Failed to process payment request" }, { status: 500 });
  }
}
