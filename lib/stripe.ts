import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_PLANS = {
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    price: 29,
    features: [
      "Unlimited AI chats",
      "All AI modules",
      "Automations (10/month)",
      "Knowledge Base (100 docs)",
      "10GB storage",
      "Priority support",
    ],
  },
  BUSINESS: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    name: "Business",
    price: 99,
    features: [
      "Everything in Pro",
      "Team collaboration (25 members)",
      "CRM + pipelines",
      "Admin panel",
      "100GB storage",
      "Custom AI prompts",
      "API access",
      "Dedicated support",
    ],
  },
};

export async function createCheckoutSession({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });
  return session;
}

export async function createBillingPortal(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}
