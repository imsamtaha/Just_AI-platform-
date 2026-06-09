import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses[0]?.email_address;
      if (!email) break;

      await db.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
          imageUrl: image_url || null,
        },
        create: {
          clerkId: id,
          email,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
          imageUrl: image_url || null,
        },
      });

      await db.auditLog.create({
        data: { userId: id, action: "USER_CREATED", resource: "user" },
      });
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses[0]?.email_address;

      await db.user.update({
        where: { clerkId: id },
        data: {
          email: email || undefined,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
          imageUrl: image_url || null,
        },
      }).catch(() => null);
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (!id) break;
      await db.user.delete({ where: { clerkId: id } }).catch(() => null);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
