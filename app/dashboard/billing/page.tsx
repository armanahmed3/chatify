"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, BILLING_PROMISES } from "@/lib/plans.ts";
import { formatCurrency } from "@/lib/utils.ts";
import {
  ShieldCheck,
  Check,
  Zap,
  ArrowRight,
  CreditCard,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("starter");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Flat usage metrics (never tokens!)
  const usedAiChats = 142;
  const limitAiChats = 2000;
  const unlimitedFaqAnswers = 892;
  const usagePercent = ((usedAiChats / limitAiChats) * 100).toFixed(1);

  const handleUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      setCurrentPlan(planKey);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Billing & Subscription Plan
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Flat, predictable pricing for small businesses. Zero per-message fees and zero surprise overages.
        </p>
      </div>

      {/* Current Subscription Status Card */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">Starter Plan</span>
              <Badge variant="success" className="text-[10px]">
                Active • 14-Day Free Trial
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Renews automatically on <strong className="text-foreground">Nov 23, 2026</strong> at $29/mo. Cancel anytime with one click.
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleOpenPortal} className="h-8 text-xs gap-1.5 self-start sm:self-auto">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Manage Payment Method</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Usage Meter: AI Chats vs Unlimited FAQ Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Smart AI Chats Used</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {usedAiChats} / {limitAiChats.toLocaleString()} ({usagePercent}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Only complex questions requiring full generative AI count toward this limit.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Instant FAQ & Cached Answers</span>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  Unlimited ($0 Cost)
                </Badge>
              </div>
              <div className="text-2xl font-black text-foreground">
                {unlimitedFaqAnswers.toLocaleString()} answers
              </div>
              <p className="text-[11px] text-muted-foreground">
                Verified hours, accepted insurance, location, and Q&A pairs are 100% free forever.
              </p>
            </div>
          </div>

          {/* Anti-Meter Reassurance */}
          <div className="rounded-lg bg-secondary/30 border border-border/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-foreground">
                Zero Overages Guarantee: If your monthly limit is reached, your bot gracefully continues collecting customer contact info rather than billing you extra.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flat Plan Comparison Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Available Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {Object.values(PLANS).map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between ${
                  plan.popular
                    ? "border-accent ring-1 ring-accent bg-card shadow-md"
                    : "border-border/70 bg-card/60"
                }`}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{plan.name}</span>
                    {plan.badge && (
                      <Badge variant="default" className="text-[9px] py-0 px-1.5">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 text-2xl font-black text-foreground">
                    {formatCurrency(plan.priceMonthly)}
                    <span className="text-[11px] font-normal text-muted-foreground">/mo</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {plan.description}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1 space-y-2 text-[11px]">
                  <div className="h-px bg-border/40 my-2" />
                  {plan.features.slice(0, 5).map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-tight">{f}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="p-5 pt-2">
                  <Button
                    size="sm"
                    variant={isCurrent ? "secondary" : plan.popular ? "default" : "outline"}
                    disabled={isCurrent || loadingPlan === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full h-8 text-xs font-semibold"
                  >
                    {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
