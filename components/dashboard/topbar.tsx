"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "./workspace-provider";
import {
  ExternalLink,
  Plus,
  Sparkles,
  MessageSquareQuote,
  Code,
  Check,
  Copy,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Menu,
} from "lucide-react";

export function DashboardTopbar() {
  const {
    activeWorkspace,
    uiMode,
    toggleUiMode,
    setIsTestDrawerOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useWorkspace();
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<script
  src="https://chatify.ai/widget.js"
  data-bot-id="${activeWorkspace.slug || 'demo-apex'}"
  data-color="${activeWorkspace.accent_color || '#2563eb'}"
  defer
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/95 px-3 sm:px-6 backdrop-blur">
        {/* Left: Mobile Menu Toggle + Workspace & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="flex md:hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border/70 bg-card text-foreground hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate max-w-[140px] sm:max-w-none">
              {activeWorkspace.name}
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-mono border-border/80 text-muted-foreground">
              {activeWorkspace.slug}
            </Badge>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground pl-2 border-l border-border/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-500">Security Hardened</span>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Simple vs Pro Mode Pill Switcher - hidden on very small phones, visible on sm+ */}
          <button
            onClick={toggleUiMode}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-secondary/60 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Toggle between Simple and Pro mode"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px]">
              {uiMode === "simple" ? (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Simple
                </span>
              ) : (
                <span className="flex items-center gap-1 text-accent font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Pro
                </span>
              )}
            </span>
          </button>

          {/* Quick Embed Script Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmbedModal(true)}
            className="hidden md:inline-flex h-8 gap-1.5 text-xs font-medium"
            title="Get 1-line website embed script"
          >
            <Code className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Embed</span>
          </Button>

          {/* Quick Test Simulator Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTestDrawerOpen(true)}
            className="h-8 px-2 sm:px-3 gap-1.5 text-xs font-medium border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent"
          >
            <MessageSquareQuote className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Test</span>
          </Button>

          {/* AI Bot Wizard CTA */}
          <Link href="/dashboard/wizard">
            <Button size="sm" className="h-8 px-2.5 sm:px-3 gap-1.5 text-xs shadow-sm bg-accent text-accent-foreground font-bold hover:bg-accent/90">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Wizard</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-accent" />
                <h3 className="text-base font-bold text-foreground">
                  Website Embed Script
                </h3>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Paste this single line of HTML before the closing <code className="text-foreground font-mono">&lt;/body&gt;</code> tag on WordPress, Shopify, Webflow, Wix, or custom HTML.
            </p>

            <div className="relative rounded-xl border border-border/60 bg-muted/60 p-4 font-mono text-xs text-foreground overflow-x-auto">
              <pre>{embedSnippet}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">
                Works automatically on all devices & mobile screens.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEmbedModal(false)}
                  className="h-8 text-xs"
                >
                  Done
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 text-xs gap-1.5 font-bold"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
