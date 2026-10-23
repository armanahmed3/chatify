"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoiWidget } from "@/components/dashboard/roi-widget";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { ArrowRight, Bot, MessageSquare, Phone, ExternalLink } from "lucide-react";

function RecentConversations() {
  const conversations = [
    {
      id: "conv-101",
      customer: "Michael Torres",
      contact: "(555) 392-1084",
      channel: "WhatsApp",
      channelBadge: "💬 WhatsApp",
      lastMessage: "Do you have an opening for root canal consultation tomorrow morning?",
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
      lastMessage: "What are your emergency care hours on Saturday?",
      sentiment: "support",
      time: "18m ago",
      status: "bot_answered",
    },
    {
      id: "conv-103",
      customer: "Robert Miller",
      contact: "(555) 781-9923",
      channel: "Instagram",
      channelBadge: "📸 Instagram",
      lastMessage: "I need to reschedule my crown fitting from Friday to next Tuesday.",
      sentiment: "booking",
      time: "1h ago",
      status: "lead_captured",
    },
    {
      id: "conv-104",
      customer: "Anonymous Visitor",
      contact: "None provided",
      channel: "Web Widget",
      channelBadge: "🌐 Website",
      lastMessage: "Do you accept MetLife dental insurance?",
      sentiment: "support",
      time: "2h ago",
      status: "bot_answered",
    },
  ];

  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border/40">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Customer Inquiries</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time feed from your Website, WhatsApp, and Instagram.
          </p>
        </div>
        <Link href="/dashboard/inbox">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <span>View All in Unified Inbox</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-border/30">
        {conversations.map((conv) => (
          <div key={conv.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
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
  return (
    <div className="space-y-8">
      {/* 1. Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Business Overview
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your AI receptionist is active and safeguarding customer inquiries across all channels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/chatbots">
            <Button size="sm" variant="outline" className="h-9 text-xs">
              Manage Chatbots
            </Button>
          </Link>
          <Link href="/dashboard/training">
            <Button size="sm" className="h-9 text-xs gap-1.5">
              <span>Train Knowledge</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. ROI Metric Cards */}
      <RoiWidget />

      {/* 3. Onboarding Guide (5 Steps) */}
      <OnboardingChecklist />

      {/* 4. Recent Inquiries Stream */}
      <RecentConversations />
    </div>
  );
}
