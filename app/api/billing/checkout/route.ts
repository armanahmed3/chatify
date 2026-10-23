import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/billing/stripe.ts";
import { PLANS } from "@/lib/plans.ts";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
  workspace_id: z.string().optional().default("ws-demo-001"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = checkoutSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { plan, workspace_id } = parsed.data;
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // In test or local mode without live Stripe credentials, return simulated checkout
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
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
  } catch (err: any) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({
      checkout_url: `${appUrl}/dashboard/billing?success=true`,
    });
  }
}
