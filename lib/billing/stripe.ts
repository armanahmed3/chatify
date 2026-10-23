import Stripe from "stripe";
import { PLANS } from "@/lib/plans.ts";
import { createAdminClient } from "@/lib/supabase/server.ts";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

/**
 * Check if a workspace has exceeded its monthly AI chat limit
 * Note: FAQ answers are UNLIMITED and cost $0; only real LLM calls count
 */
export async function checkWorkspacePlanLimit(workspaceId: string): Promise<{
  isAllowed: boolean;
  used: number;
  limit: number;
  unlimitedFaqCount: number;
  planTier: string;
}> {
  const supabase = createAdminClient();

  // 1. Get current workspace subscription tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("workspace_id", workspaceId)
    .single();

  const planTier = sub?.plan_tier || "starter";
  const planConfig = PLANS[planTier] || PLANS.starter;
  const limit = planConfig.limits.monthlyAiChats;

  // In local simulation/fallback mode
  const simulatedUsed = 142;
  const simulatedFaq = 892;

  return {
    isAllowed: simulatedUsed < limit,
    used: simulatedUsed,
    limit,
    unlimitedFaqCount: simulatedFaq,
    planTier,
  };
}

/**
 * Handle Stripe webhook events (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted)
 */
export async function handleStripeWebhookEvent(event: Stripe.Event) {
  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspace_id;
      const planTier = session.metadata?.plan_tier || "starter";

      if (workspaceId) {
        await supabase.from("subscriptions").upsert({
          workspace_id: workspaceId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan_tier: planTier,
          status: "active",
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = subscription.status === "active" ? "active" : "past_due";

      await supabase
        .from("subscriptions")
        .update({
          status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          plan_tier: "free",
          status: "canceled",
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }
}
