"use client";

import { useWorkspace } from "./workspace-provider";
import { TestChatPanel } from "./test-chat-panel";
import { X, Sparkles, MessageCircle, ExternalLink, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickTestDrawer() {
  const { isTestDrawerOpen, setIsTestDrawerOpen, uiMode, toggleUiMode, activeWorkspace } = useWorkspace();

  if (!isTestDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={() => setIsTestDrawerOpen(false)} />

      {/* Drawer content */}
      <div className="w-full max-w-lg bg-card border-l border-border/80 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent font-bold">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Live Chat Simulator
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Test your bot’s direct answers, pricing & tone in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleUiMode}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 min-h-[44px] flex items-center rounded-md border border-border/60 hover:bg-secondary/60 gap-1"
              title="Toggle diagnostic view (intent, latency, citations)"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="hidden xs:inline">{uiMode === "simple" ? "Diagnostics" : "Hide"}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsTestDrawerOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-4 py-2.5 bg-accent/10 border-b border-accent/20 text-xs flex items-center justify-between">
          <span className="text-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Direct-Answer Rule Active: Bot answers pricing & hours immediately.
          </span>
          <Link href="/dashboard/chatbots" onClick={() => setIsTestDrawerOpen(false)}>
            <span className="text-[11px] text-accent hover:underline flex items-center gap-0.5 font-bold">
              Edit Bot <ExternalLink className="h-3 w-3" />
            </span>
          </Link>
        </div>

        {/* Chat Panel Body */}
        <div className="flex-1 p-4 overflow-y-auto">
          <TestChatPanel />
        </div>
      </div>
    </div>
  );
}
