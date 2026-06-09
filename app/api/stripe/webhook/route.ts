import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0].price.id;

        let plan: "PRO" | "BUSINESS" = "PRO";
        if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) plan = "BUSINESS";

        await db.user.update({
          where: { clerkId: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
          },
        });

        await db.subscription.create({
          data: {
            userId: userId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            plan,
            status: "ACTIVE",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "CANCELED" },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await db.invoice.create({
          data: {
            userId: "",
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "PAID",
            paidAt: invoice.status_transitions.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : null,
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
  }

  return NextResponse.json({ received: true });
}
