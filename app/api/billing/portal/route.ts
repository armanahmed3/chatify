import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverError } from "@/lib/http";
import { stripe } from "@/lib/billing/stripe";
import { verifyWorkspaceAccess } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/supabase/server";

const portalSchema = z.object({ workspace_id: z.string().min(1).max(100) });

export async function POST(request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const stripeConfigured =
      !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder");

    const parsed = portalSchema.safeParse(await request.json().catch(() => ({})));

    if (!stripeConfigured && process.env.NODE_ENV !== "production") {
      return NextResponse.json({ portal_url: `${appUrl}/dashboard/billing` });
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "workspace_id is required." }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(parsed.data.workspace_id, "owner");
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const { data: sub } = await createAdminClient()
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("workspace_id", parsed.data.workspace_id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found for this workspace." }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ portal_url: session.url });
  } catch (err) {
    return serverError(err, "billing.portal");
  }
}
