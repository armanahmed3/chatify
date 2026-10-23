"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRY_TEMPLATES } from "@/lib/templates.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Utensils,
  HeartPulse,
  Wrench,
  Scissors,
  Building2,
  ShoppingBag,
  Scale,
  Dumbbell,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Utensils,
  HeartPulse,
  Wrench,
  Scissors,
  Building2,
  ShoppingBag,
  Scale,
  Dumbbell,
};

export default function TemplatesGalleryPage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [deploying, setDeploying] = useState<string | null>(null);

  const handleUseTemplate = async (templateId: string) => {
    setDeploying(templateId);
    const tpl = Object.values(INDUSTRY_TEMPLATES).find((t) => t.id === templateId);
    if (!tpl) return;

    try {
      // Create new bot with pre-loaded instructions and Q&As
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: "ws-demo-001",
          name: tpl.name,
          description: tpl.description,
          personality: tpl.personality,
          tone: tpl.tone,
          instructions: tpl.instructions,
          welcome_message: `Welcome! How can we help you today with our ${tpl.name.toLowerCase()}?`,
        }),
      });

      // Bulk import the template's ready Q&As
      await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "qa",
          title: `${tpl.name} Pre-Loaded FAQs`,
          qa_pairs: tpl.qaPairs,
        }),
      });

      router.push("/dashboard/chatbots");
    } catch {
      router.push("/dashboard/chatbots");
    } finally {
      setDeploying(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Turnkey Industry Templates
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Launch a pre-configured AI receptionist trained with 15–25 industry-specific Q&As, suggested prompts, and booking actions in 1 click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {Object.values(INDUSTRY_TEMPLATES).map((tpl) => {
          const Icon = ICON_MAP[tpl.icon] || Sparkles;
          const isDeploying = deploying === tpl.id;

          return (
            <Card
              key={tpl.id}
              className="flex flex-col justify-between border-border/70 bg-card hover:border-foreground/30 shadow-sm transition-all"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {tpl.industry.replace("_", " ")}
                  </Badge>
                </div>
                <div className="mt-3 text-sm font-bold text-foreground">{tpl.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {tpl.description}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex-1 space-y-2 text-xs">
                <div className="h-px bg-border/40 my-2" />
                <div className="font-semibold text-foreground text-[11px]">Includes:</div>
                <div className="space-y-1 text-muted-foreground text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>{tpl.qaPairs.length} Pre-loaded FAQs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>{tpl.suggestedQuestions.length} Prompt Chips</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Auto-lead qualification</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-2">
                <Button
                  size="sm"
                  disabled={isDeploying}
                  onClick={() => handleUseTemplate(tpl.id)}
                  className="w-full h-8 text-xs font-semibold gap-1.5 shadow-sm"
                >
                  {isDeploying ? (
                    <>
                      <Zap className="h-3 w-3 animate-spin" /> Deploying...
                    </>
                  ) : (
                    <>
                      <span>Use Template</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
