"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Check, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import { PUBLIC_PLANS, BILLING_PROMISES } from "@/lib/plans";
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
            Simple monthly pricing
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Try any plan free for 7 days. No credit card needed. Cancel anytime.
          </p>

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

      </div>
    </section>
  );
}
