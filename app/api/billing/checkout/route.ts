import { NextRequest, NextResponse } from "next/server";
import { serverError } from "@/lib/http";
import { z } from "zod";
import { stripe } from "@/lib/billing/stripe";
import { PLANS } from "@/lib/plans";
import { verifyWorkspaceAccess } from "@/lib/auth/guard";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
  workspace_id: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const { plan, workspace_id } = parsed.data;

    // Only workspace owners may change billing (server-side permission enforcement).
    const access = await verifyWorkspaceAccess(workspace_id, "owner");
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // In local mode without live Stripe credentials, return simulated checkout (never in production)
    if (
      process.env.NODE_ENV !== "production" &&
      (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder"))
    ) {
      return NextResponse.json({
        checkout_url: `${appUrl}/dashboard/billing?success=true&plan=${plan}`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Chatify ${planConfig.name} Plan`,
              description: `Flat monthly rate • ${planConfig.limits.monthlyAiChats.toLocaleString()} AI Chats • Unlimited FAQ Answers`,
            },
            unit_amount: planConfig.priceMonthly * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata: { workspace_id, plan_tier: plan },
      },
      metadata: { workspace_id, plan_tier: plan },
      success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (err) {
    return serverError(err, "billing.checkout");
  }
}
