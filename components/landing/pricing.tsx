"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Check, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import { PUBLIC_PLANS, BILLING_PROMISES, RECEPTIONIST_COMPARISON } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";

export function LandingPricing() {
  return (
    <section id="pricing" className="border-t border-border/40 py-20 md:py-28 bg-card/20">
      <div className="container max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 gap-1.5 border-accent/40 bg-accent/10 px-3 py-1 text-xs text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span>7-Day Free Trial • No Credit Card Required</span>
          </Badge>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Try Free For 7 Days. Zero Risk, Flat Pricing.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Deploy your custom AI chatbot in 3 minutes. Test lead capture, human takeover, and instant answers completely free for 7 days.
          </p>

          {/* Promise Badge */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/80 bg-background px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
            <span>🛡️ 7-Day Free Trial</span>
            <span className="text-muted-foreground">•</span>
            <span>No Credit Card Needed</span>
            <span className="text-muted-foreground">•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>

        {/* 3 Flat Pricing Cards */}
        <div className="mt-16 mx-auto max-w-5xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {PUBLIC_PLANS.map((plan) => {
            const isPopular = plan.popular;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all ${
                  isPopular
                    ? "border-accent shadow-xl bg-card scale-[1.02] ring-1 ring-accent"
                    : "border-border/70 bg-card hover:border-foreground/30 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-accent px-3 py-0.5 text-[11px] font-bold text-accent-foreground shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardHeader className="pt-8 pb-4">
                  <div className="text-lg font-bold text-foreground">{plan.name}</div>
                  <div className="text-xs text-muted-foreground min-h-[32px] mt-1">
                    {plan.description}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {formatCurrency(plan.priceMonthly)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>

                  {plan.pricePerDay > 0 ? (
                    <div className="text-[11px] font-medium text-emerald-400 mt-1">
                      Just ${plan.pricePerDay.toFixed(2)} / day
                    </div>
                  ) : (
                    <div className="text-[11px] font-medium text-muted-foreground mt-1">
                      Forever free
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-2 text-xs">
                  <div className="h-px w-full bg-border/60 mb-4" />
                  <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                    What&apos;s Included:
                  </div>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                      <span className="text-muted-foreground leading-tight">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-4">
                  <Link href={`/signup?plan=${plan.id}`} className="w-full">
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      className="w-full text-xs font-semibold h-11 sm:h-10 min-h-[44px] shadow-sm gap-1.5"
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Human Receptionist Comparison Box */}
        <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-border/80 bg-background p-6 sm:p-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <span>The Math Behind Chatify</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Compare to a Full-Time Human Receptionist
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                A typical receptionist costs <span className="text-foreground font-semibold">$2,000/month</span> for 40 hours/week, takes sick leave, and speaks 1-2 languages. Chatify Starter costs <span className="text-emerald-400 font-semibold">$29/month</span>, runs 168 hours/week (24/7/365), and speaks 95+ languages.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5 text-center shrink-0 min-w-[220px]">
              <div className="text-xs text-muted-foreground font-medium">Estimated Monthly Savings</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                ${RECEPTIONIST_COMPARISON.monthlySavings.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                + Zero missed evening leads
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
