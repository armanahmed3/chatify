"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoiWidget } from "@/components/dashboard/roi-widget";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { TestChatPanel } from "@/components/dashboard/test-chat-panel";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  BrainCircuit,
  Share2,
  Code,
  Flame,
  CheckCircle2,
  Activity,
  Layers,
  HelpCircle,
  Clock,
  Check,
  Copy,
} from "lucide-react";

function RecentConversations({ workspace }: { workspace: any }) {
  const isDemo = workspace.id === "ws-demo-001";
  const [conversations, setConversations] = useState<any[]>(() => {
    if (isDemo) {
      return [
        {
          id: "conv-101",
          customer: "Michael Torres",
          contact: "(555) 392-1084",
          channel: "WhatsApp",
          channelBadge: "💬 WhatsApp",
          lastMessage: "Do you have an opening for consultation tomorrow morning?",
          sentiment: "booking",
          time: "4m ago",
          status: "lead_captured",
        },
        {
          id: "conv-102",
          customer: "Sarah Jenkins",
          contact: "sarah.j@gmail.com",
          channel: "Web Widget",
          channelBadge: "🌐 Website",
          lastMessage: "What are your business hours on Saturday?",
          sentiment: "support",
          time: "18m ago",
          status: "bot_answered",
        },
      ];
    }
    try {
      const saved = localStorage.getItem(`chatify_conversations_${workspace.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  if (!isDemo && conversations.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-8 text-center space-y-3 shadow-sm">
        <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Clean Inbox • Ready for First Visitor</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Your 24/7 AI Receptionist for <strong>{workspace.name}</strong> is live and waiting.
            When visitors message via your Website widget, WhatsApp, or Instagram, their chats will stream here.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link href="/dashboard/channels">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 font-semibold">
              <Code className="h-3.5 w-3.5" />
              <span>Get Widget Script</span>
            </Button>
          </Link>
          <Link href="/dashboard/inbox">
            <Button size="sm" className="h-8 text-xs gap-1.5 font-semibold">
              <span>Open Unified Inbox</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Customer Inquiries</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time feed from your Website, WhatsApp, and Instagram.
          </p>
        </div>
        <Link href="/dashboard/inbox">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <span>View Inbox</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-border/30">
        {conversations.map((conv) => (
          <div key={conv.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground">{conv.customer}</span>
                <span className="text-[11px] font-mono text-muted-foreground">({conv.contact})</span>
                <Badge variant="outline" className="text-[10px] py-0 px-2">
                  {conv.channelBadge}
                </Badge>
                {conv.status === "lead_captured" && (
                  <Badge variant="success" className="text-[10px] py-0 px-2">
                    🎯 Lead Captured
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                &ldquo;{conv.lastMessage}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-muted-foreground">{conv.time}</span>
              <Link href={`/dashboard/inbox?id=${conv.id}`}>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Open Chat
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { activeWorkspace, uiMode, setIsTestDrawerOpen } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"overview" | "preview" | "checklist">("overview");

  return (
    <div className="space-y-8">
      {/* 1. Header greeting & quick status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {activeWorkspace.name}
            </h2>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Bot Live 24/7
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Answering pricing, services, and scheduling patient appointments automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTestDrawerOpen(true)}
            className="h-9 text-xs gap-1.5 border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent font-semibold"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Test Bot Now</span>
          </Button>

          <Link href="/dashboard/wizard">
            <Button size="sm" className="h-9 text-xs gap-1.5 bg-accent text-accent-foreground font-bold shadow-sm hover:bg-accent/90">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Bot Wizard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Fast-Start 3-Card Guided Hub (Made Simple for Non-Engineers & Engineers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 5-Step Wizard */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm hover:border-accent/50 transition-all flex flex-col justify-between group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wide px-2 py-0.5 rounded bg-accent/10 text-accent">
                Step 1 • 3 Mins
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
              AI Bot Wizard
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pick your industry template (Dental, Restaurant, Salon, etc.), customize tone, and configure instant direct pricing rules.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-border/40">
            <Link href="/dashboard/wizard">
              <Button size="sm" className="w-full h-8 text-xs font-semibold gap-1.5">
                <span>Open Wizard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Card 2: Knowledge & Pricing */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 font-bold">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wide px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                Step 2 • Knowledge
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors">
              Add Business Info & FAQs
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Crawl your website URL or enter your services, pricing, business hours, and insurance plans with verified answers.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-border/40">
            <Link href="/dashboard/training">
              <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold gap-1.5">
                <span>Add Knowledge</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Card 3: Multi-Channel Launch */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 font-bold">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wide px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                Step 3 • Connect
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
              Website & WhatsApp
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste a 1-line script onto your website, or link your WhatsApp and Instagram accounts to capture leads everywhere.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-border/40">
            <Link href="/dashboard/channels">
              <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold gap-1.5">
                <span>View Channels</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Pro Mode Diagnostics Banner (Only shown if in Pro Mode) */}
      {uiMode === "pro" && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-foreground">
                Developer & Engine Diagnostics (Pro Mode Active)
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              Latency: ~28ms • Zero-Hallucination Safe
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground">RAG Vector Chunks</span>
              <div className="text-sm font-bold text-foreground font-mono mt-0.5">142 Chunks</div>
            </div>
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground">Semantic Cache Hits</span>
              <div className="text-sm font-bold text-emerald-500 font-mono mt-0.5">64.8%</div>
            </div>
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground">Security Hardening</span>
              <div className="text-sm font-bold text-foreground font-mono mt-0.5">RLS + SSRF Guard</div>
            </div>
            <div className="rounded-lg bg-card/80 p-2.5 border border-border/50">
              <span className="text-[10px] text-muted-foreground">AI Router Failover</span>
              <div className="text-sm font-bold text-foreground font-mono mt-0.5">Gemini ➔ Groq</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab Navigation for Workspace Views */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            Activity & ROI
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Live Chat Simulator</span>
            <span className="text-[9px] bg-accent/20 text-accent font-mono px-1 rounded">Interactive</span>
          </button>
          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "checklist"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            Setup Guide (5 Steps)
          </button>
        </div>

        {/* Tab 1: Activity & Inquiries */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <RoiWidget />
            <RecentConversations workspace={activeWorkspace} />
          </div>
        )}

        {/* Tab 2: Interactive Live Preview Simulator */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Interactive Chat Simulator
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Test how your virtual receptionist answers real questions. Try asking: <strong className="text-foreground">&ldquo;Kitni price hai teeth cleaning ki?&rdquo;</strong>
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  demo-apex
                </Badge>
              </div>
              <TestChatPanel />
            </div>
          </div>
        )}

        {/* Tab 3: Setup Checklist */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            <OnboardingChecklist />
          </div>
        )}
      </div>
    </div>
  );
}
