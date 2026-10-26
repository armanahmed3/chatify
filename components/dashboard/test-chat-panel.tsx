"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Send,
  Zap,
  ShieldAlert,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Bot,
  User,
} from "lucide-react";

interface TestMessage {
  sender: "user" | "bot";
  text: string;
  provider?: string;
  citations?: Array<{ title: string; snippet?: string }>;
  confidence?: number;
  sentiment?: string;
  intent?: string;
  isAngry?: boolean;
  latencyMs?: number;
}

export function TestChatPanel() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<TestMessage[]>([
    {
      sender: "bot",
      text: "Hello! I am your test assistant. Ask me questions about services, pricing, or hours to verify retrieval accuracy.",
      provider: "System Initializer",
      confidence: 1.0,
      latencyMs: 12,
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    const newHistory = [...messages, { sender: "user" as const, text: userText }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/demo-apex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          session_id: "test-debugger-session",
          history: newHistory.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer,
          provider: data.provider,
          citations: data.citations,
          confidence: data.confidence,
          sentiment: data.sentiment,
          intent: data.intent,
          isAngry: data.is_angry_customer,
          latencyMs: data.latency_ms,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am ready to assist you. All dental cleanings and exams start at $95 with insurance accepted.",
          provider: "Local Diagnostic Fallback",
          confidence: 0.9,
          latencyMs: 45,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/70 shadow-sm flex flex-col h-[580px]">
      <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-bold">Interactive Test & Diagnostic Panel</CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          Free AI Router Live
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-secondary text-secondary-foreground border border-border/60"
                }`}
              >
                {m.text}
              </div>
            </div>

            {/* Diagnostic Meta info for Bot Responses */}
            {m.sender === "bot" && (
              <div className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-2 px-1">
                {m.provider && (
                  <span className="flex items-center gap-1 font-mono text-emerald-400">
                    <Zap className="h-3 w-3" /> {m.provider}
                  </span>
                )}
                {m.latencyMs && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" /> {m.latencyMs}ms
                  </span>
                )}
                {m.confidence !== undefined && (
                  <span>
                    Confidence: <strong>{Math.round(m.confidence * 100)}%</strong>
                  </span>
                )}
                {m.intent && (
                  <Badge variant="outline" className="text-[9px] py-0 px-1 uppercase">
                    {m.intent}
                  </Badge>
                )}
                {m.isAngry && (
                  <Badge variant="destructive" className="text-[9px] py-0 px-1 flex items-center gap-0.5">
                    <ShieldAlert className="h-2.5 w-2.5" /> Angry Guard Triggered
                  </Badge>
                )}
              </div>
            )}

            {/* Citations Snippets */}
            {m.citations && m.citations.length > 0 && (
              <div className="text-[10px] bg-background/60 border border-border/40 rounded p-2 text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground">Retrieved Context Sources:</span>
                {m.citations.map((c, ci) => (
                  <div key={ci} className="truncate">
                    • <strong>{c.title}</strong>: {c.snippet}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>

      <form onSubmit={handleSend} className="p-3 border-t border-border/40 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. 'Do you take Delta Dental?' or 'I want to speak with a manager')..."
          className="h-11 sm:h-9 text-base sm:text-xs"
        />
        <Button type="submit" size="sm" disabled={loading} className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 px-4 text-xs gap-1.5 shrink-0">
          <Send className="h-3.5 w-3.5" />
          <span>Test</span>
        </Button>
      </form>
    </Card>
  );
}
