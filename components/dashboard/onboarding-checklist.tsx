"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";

export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<number[]>([1, 2]);

  const steps = [
    {
      id: 1,
      title: "Create your chatbot persona",
      description: "Define bot name, friendly tone, and business hours.",
      link: "/dashboard/chatbots",
      action: "Edit Bot",
    },
    {
      id: 2,
      title: "Train on your website or services",
      description: "Add your website link or upload price lists.",
      link: "/dashboard/training",
      action: "Add Sources",
    },
    {
      id: 3,
      title: "Test your bot in the playground",
      description: "Verify that answers, prices, and bookings work accurately.",
      link: "/dashboard/chatbots",
      action: "Test Chat",
    },
    {
      id: 4,
      title: "Install widget or connect WhatsApp",
      description: "Embed on your website with one script tag or link Meta.",
      link: "/dashboard/channels",
      action: "Get Widget Code",
    },
    {
      id: 5,
      title: "Turn on live customer chat",
      description: "Start capturing 24/7 leads and answering customer queries.",
      link: "/dashboard/inbox",
      action: "Go Live",
    },
  ];

  const progressPercent = (completed.length / steps.length) * 100;

  return (
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/40 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-base font-bold text-foreground">
              Getting Started with Chatify
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete these 5 quick steps to have your AI receptionist live today.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-foreground">
            {completed.length} of {steps.length} completed
          </div>
          <div className="mt-1.5 h-2 w-32 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border/30">
        {steps.map((step) => {
          const isDone = completed.includes(step.id);
          return (
            <div
              key={step.id}
              className="py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/20 rounded-lg px-2"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCompleted((prev) =>
                      isDone ? prev.filter((id) => id !== step.id) : [...prev, step.id]
                    );
                  }}
                  className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/60" />
                  )}
                </button>
                <div>
                  <div
                    className={`text-xs font-semibold ${
                      isDone ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>

              <Link href={step.link}>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <span>{step.action}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
