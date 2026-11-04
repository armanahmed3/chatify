"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { Bot, BookOpen, Code, ArrowRight, MessageSquare, Play } from "lucide-react";

const STEPS = [
  {
    icon: Bot,
    title: "Set up your chatbot",
    text: "Pick your type of business, give the bot a name and a greeting.",
    href: "/dashboard/wizard",
    cta: "Start setup",
  },
  {
    icon: BookOpen,
    title: "Teach it about your business",
    text: "Add your website link, prices, opening hours or common questions.",
    href: "/dashboard/training",
    cta: "Add information",
  },
  {
    icon: Code,
    title: "Put it on your website",
    text: "Copy one line of code into your site. Find it under My Chatbot → Embed.",
    href: "/dashboard/chatbots?tab=embed",
    cta: "Get the code",
  },
];

function RecentConversations({ workspaceId }: { workspaceId: string }) {
  const [conversations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`chatify_conversations_${workspaceId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />
        <h3 className="mt-3 text-base font-semibold">No conversations yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          When customers chat with your bot, their messages will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {conversations.slice(0, 5).map((c) => (
        <Link key={c.id} href={`/dashboard/inbox?id=${c.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-secondary/40">
          <div className="min-w-0">
            <p className="text-sm font-medium">{c.customer}</p>
            <p className="truncate text-sm text-muted-foreground">{c.lastMessage}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { activeWorkspace, setIsTestDrawerOpen } = useWorkspace();

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {activeWorkspace.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Three steps to get your chatbot answering customers.</p>
        </div>
        <Button onClick={() => setIsTestDrawerOpen(true)} variant="outline" className="gap-2">
          <Play className="h-4 w-4" /> Test chatbot
        </Button>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <s.icon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
            <Link href={s.href} className="mt-4">
              <Button size="sm" variant={i === 0 ? "default" : "outline"} className="w-full gap-1.5">
                {s.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </li>
        ))}
      </ol>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Recent conversations</h3>
          <Link href="/dashboard/inbox" className="text-sm text-accent hover:underline">
            See all
          </Link>
        </div>
        <RecentConversations workspaceId={activeWorkspace.id} />
      </section>
    </div>
  );
}
