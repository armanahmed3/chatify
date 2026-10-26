"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { INDUSTRY_TEMPLATES, matchOrCreateBusinessTemplate, IndustryTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import {
  Utensils,
  HeartPulse,
  Wrench,
  Scissors,
  Building2,
  ShoppingBag,
  Scale,
  Dumbbell,
  Stethoscope,
  Hotel,
  GraduationCap,
  Sparkles,
  Laptop,
  Flame,
  Compass,
  Camera,
  Dog,
  Calculator,
  ArrowRight,
  Check,
  Zap,
  Search,
  SlidersHorizontal,
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
  Stethoscope,
  Hotel,
  GraduationCap,
  Sparkles,
  Laptop,
  Flame,
  Compass,
  Camera,
  Dog,
  Calculator,
};

export default function TemplatesGalleryPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deploying, setDeploying] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Industries" },
    { id: "health", label: "Health & Medical", match: ["dental", "healthcare", "veterinary"] },
    { id: "hospitality", label: "Food & Hospitality", match: ["restaurant", "hotel", "travel"] },
    { id: "services", label: "Services & Trades", match: ["garage", "salon", "cleaning", "hvac"] },
    { id: "professional", label: "Professional & Tech", match: ["law_firm", "accounting", "saas", "education"] },
    { id: "lifestyle", label: "Lifestyle & Retail", match: ["gym", "real_estate", "ecommerce", "photography"] },
  ];

  const allTemplates = Object.values(INDUSTRY_TEMPLATES);

  // Filter templates based on category & search query
  const filteredTemplates = allTemplates.filter((tpl) => {
    // Category check
    if (selectedCategory !== "all") {
      const activeCat = categories.find((c) => c.id === selectedCategory);
      if (activeCat && activeCat.match && !activeCat.match.includes(tpl.industry)) {
        return false;
      }
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = tpl.name.toLowerCase().includes(q);
      const inDesc = tpl.description.toLowerCase().includes(q);
      const inIndustry = tpl.industry.toLowerCase().includes(q);
      const inQuestions = tpl.suggestedQuestions.some((s) => s.toLowerCase().includes(q));
      return inName || inDesc || inIndustry || inQuestions;
    }

    return true;
  });

  const handleUseTemplate = async (templateId: string) => {
    setDeploying(templateId);
    const tpl = Object.values(INDUSTRY_TEMPLATES).find((t) => t.id === templateId);
    if (!tpl) {
      setDeploying(null);
      return;
    }

    try {
      localStorage.setItem("chatify_active_template_id", tpl.id);
      localStorage.setItem("chatify_active_template", JSON.stringify(tpl));
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    try {
      const workspaceId = activeWorkspace?.id || "ws-demo-001";
      await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: tpl.name,
          description: tpl.description,
          personality: tpl.personality,
          tone: tpl.tone,
          instructions: tpl.instructions,
          welcome_message: `Welcome! How can we help you today with ${tpl.name}?`,
        }),
      });

      await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "qa",
          title: `${tpl.name} Pre-Loaded FAQs`,
          qa_pairs: tpl.qaPairs,
        }),
      });
    } catch (e) {
      console.warn("Template deployment warning:", e);
    } finally {
      setDeploying(null);
      router.push(`/dashboard/chatbots?template=${tpl.id}`);
    }
  };

  const handleDynamicGenerate = () => {
    if (!searchQuery.trim()) return;
    const generated = matchOrCreateBusinessTemplate(searchQuery, "My Business");
    try {
      localStorage.setItem("chatify_active_template_id", generated.id);
      localStorage.setItem("chatify_active_template", JSON.stringify(generated));
    } catch {}
    router.push(`/dashboard/wizard?template=${generated.id}&desc=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Turnkey Industry Templates ({allTemplates.length})
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pre-configured with industry-specific pricing rules, direct-answering personas, verified FAQs, and lead capture triggers.
          </p>
        </div>

        <Link href="/dashboard/wizard">
          <Button size="sm" className="h-9 gap-1.5 text-xs font-bold bg-accent text-accent-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch 5-Step Wizard</span>
          </Button>
        </Link>
      </div>

      {/* AI Business Explainer & Search Bar */}
      <div className="rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/10 via-card to-background p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold text-xs">
            ✨
          </span>
          <h3 className="text-sm font-bold text-foreground">
            Smart Business Matcher & Custom Generator
          </h3>
          <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30 ml-auto">
            Instant Match
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Type your industry or describe what your business does (e.g., <em>&ldquo;24/7 mobile auto locksmith in Austin&rdquo;</em>, <em>&ldquo;organic sourdough bakery&rdquo;</em>, or <em>&ldquo;pediatric dental clinic&rdquo;</em>).
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 18+ templates or explain your business in plain English..."
              className="pl-9 h-10 text-xs bg-background/90"
            />
          </div>
          {searchQuery.trim().length > 5 && (
            <Button
              onClick={handleDynamicGenerate}
              className="h-10 text-xs gap-1.5 font-bold bg-accent text-accent-foreground shrink-0 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Custom Bot</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-foreground text-background shadow-sm font-bold"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tpl) => {
          const IconComponent = ICON_MAP[tpl.icon] || Building2;
          const isCurrentDeploying = deploying === tpl.id;

          return (
            <Card
              key={tpl.id}
              className="border-border/70 shadow-sm hover:border-accent/50 hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden bg-card"
            >
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors shadow-sm">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize font-mono text-muted-foreground">
                      {tpl.industry.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {tpl.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tpl.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  {/* Verified FAQs preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Pre-Loaded Verified Answers ({tpl.qaPairs.length}):
                    </span>
                    <div className="space-y-1 bg-secondary/30 rounded-lg p-2.5 border border-border/40">
                      {tpl.qaPairs.slice(0, 2).map((qa, i) => (
                        <div key={i} className="text-[11px] text-foreground font-medium truncate">
                          • {qa.question}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Starter Chips */}
                  <div className="flex flex-wrap gap-1">
                    {tpl.suggestedQuestions.slice(0, 2).map((chip, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-border/40 bg-secondary/10 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Direct Answer First
                </span>
                <Button
                  size="sm"
                  onClick={() => handleUseTemplate(tpl.id)}
                  disabled={isCurrentDeploying}
                  className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
                >
                  {isCurrentDeploying ? (
                    <span>Deploying...</span>
                  ) : (
                    <>
                      <span>Apply Template</span>
                      <ArrowRight className="h-3 w-3" />
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
