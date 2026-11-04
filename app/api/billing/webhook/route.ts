import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/http";
import { stripe, handleStripeWebhookEvent } from "@/lib/billing/stripe";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const rateCheck = await checkRateLimit(getClientIp(request), "WEBHOOKS");
  if (!rateCheck.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      if (process.env.NODE_ENV !== "development") {
        logger.error("STRIPE_WEBHOOK_SECRET is not configured in production environment");
        return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
      }
      event = JSON.parse(body);
    }

    await handleStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    logger.warn("Stripe webhook verification failed", { reason: err?.message });
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }
}
