"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./workspace-provider";
import { Code, Check, Copy, Menu, X } from "lucide-react";
import { getEmbedSnippet } from "@/lib/embed";

export function DashboardTopbar() {
  const { activeWorkspace, isMobileSidebarOpen, setIsMobileSidebarOpen } = useWorkspace();
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = getEmbedSnippet(activeWorkspace.slug || "demo-apex", activeWorkspace.accent_color || "#2563eb");

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/70 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="max-w-[180px] truncate text-sm font-semibold sm:max-w-none">{activeWorkspace.name}</h1>
        </div>

        <Button variant="outline" size="sm" onClick={() => setShowEmbed(true)} className="h-9 gap-2 text-sm">
          <Code className="h-4 w-4" />
          <span className="hidden sm:inline">Add to website</span>
        </Button>
      </header>

      {showEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Add the chatbot to your website</h3>
              <button onClick={() => setShowEmbed(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Copy the code below.</li>
              <li>
                Paste it just before the <code className="font-mono text-foreground">&lt;/body&gt;</code> tag of your website.
              </li>
              <li>Save and refresh your site. The chat bubble appears in the corner.</li>
            </ol>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs">{snippet}</pre>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEmbed(false)}>
                Close
              </Button>
              <Button size="sm" onClick={copy} className="gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy code"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
