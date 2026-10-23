"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "./workspace-provider";
import { ExternalLink, Plus, Bell } from "lucide-react";

export function DashboardTopbar() {
  const { activeWorkspace } = useWorkspace();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-foreground tracking-tight">
          {activeWorkspace.name}
        </h1>
        <Badge variant="outline" className="text-[11px] font-medium border-border/80">
          Workspace ID: {activeWorkspace.slug}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Link href={`/chat/demo-apex`} target="_blank">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <span>Test Public Bot</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </Link>

        <Link href="/dashboard/chatbots?new=true">
          <Button size="sm" className="h-8 gap-1.5 text-xs shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            <span>New Chatbot</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
