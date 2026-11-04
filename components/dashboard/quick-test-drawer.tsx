"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { TestChatPanel } from "./test-chat-panel";

export function QuickTestDrawer() {
  const { isTestDrawerOpen, setIsTestDrawerOpen } = useWorkspace();
  if (!isTestDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="flex-1" onClick={() => setIsTestDrawerOpen(false)} />
      <div className="flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-semibold">Test your chatbot</h3>
            <p className="text-sm text-muted-foreground">Ask a question the way a customer would.</p>
          </div>
          <button
            onClick={() => setIsTestDrawerOpen(false)}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <TestChatPanel />
        </div>
        <div className="border-t border-border p-3 text-center text-sm">
          <Link href="/dashboard/chatbots" onClick={() => setIsTestDrawerOpen(false)} className="text-accent hover:underline">
            Change how the chatbot answers
          </Link>
        </div>
      </div>
    </div>
  );
}
