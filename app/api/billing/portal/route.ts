import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe.ts";

export async function POST(request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      return NextResponse.json({ portal_url: `${appUrl}/dashboard/billing` });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: "cus_demo_customer",
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ portal_url: session.url });
  } catch (err: any) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({ portal_url: `${appUrl}/dashboard/billing` });
  }
}
