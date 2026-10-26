import { NextRequest, NextResponse } from "next/server";
import { stripe, handleStripeWebhookEvent } from "@/lib/billing/stripe";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const rateCheck = await checkRateLimit(request.ip || "stripe-webhook", "WEBHOOKS");
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
      if (process.env.NODE_ENV === "production") {
        logger.error("STRIPE_WEBHOOK_SECRET is not configured in production environment");
        return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
      }
      event = JSON.parse(body);
    }

    await handleStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    logger.warn("Stripe webhook verification failed", { error: err.message });
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
}
