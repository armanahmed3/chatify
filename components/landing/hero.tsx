"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Globe,
  CheckCircle2,
  Bot,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function LandingHero() {
  const [demoUrl, setDemoUrl] = useState("apex-dental.com");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawled, setCrawled] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "Hello! Welcome to Apex Dental Clinic. How can I assist you with your smile today?",
    },
  ]);

  const handleSimulateCrawl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoUrl) return;
    setIsCrawling(true);
    setCrawled(false);

    setTimeout(() => {
      setIsCrawling(false);
      setCrawled(true);
      setChatHistory([
        {
          sender: "bot",
          text: `Trained on ${demoUrl}! I've indexed your services, hours (Mon-Sat 8am-6pm), emergency care info, and insurance plans. Ask me anything!`,
        },
      ]);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);

    setTimeout(() => {
      let reply = "Yes! We accept Delta Dental, Cigna, and MetLife, and we have emergency weekend appointments open.";
      if (userText.toLowerCase().includes("cost") || userText.toLowerCase().includes("price")) {
        reply = "Routine cleanings start at $95. For root canals or crowns, we offer a free consultation and flexible financing.";
      } else if (userText.toLowerCase().includes("book") || userText.toLowerCase().includes("appointment")) {
        reply = "I can book you right now! Would tomorrow at 10:00 AM or 2:30 PM suit you better? Please share your phone number so Dr. Sarah can confirm.";
      }
      setChatHistory((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background radial gradient accent */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
        <div className="h-[500px] w-[600px] rounded-full bg-accent/30 blur-[130px]" />
      </div>

      <div className="container relative max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 gap-2 border-border/80 px-3.5 py-1 text-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground">Zero-Code AI Engine for Local Businesses</span>
          </Badge>

          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Never Miss Another Customer.{" "}
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              AI Chatbot Trained on Your Business in 5 Minutes.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground">
            Auto repair shops, dental clinics, salons, restaurants, and retail stores use Chatify to answer customer questions 24/7, book appointments, and capture high-value leads across Website, WhatsApp, and Instagram.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base shadow-xl gap-2 justify-center">
                <span>Build Your Free Chatbot</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="h-12 w-full sm:w-auto px-8 text-base justify-center">
                View Flat Pricing (From $29/mo)
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No API keys needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Flat pricing • Zero per-message fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 14-day trial • No card upfront
            </span>
          </div>
        </div>

        {/* 5-Minute Interactive Onboarding Simulator Canvas */}
        <div className="mt-14 mx-auto max-w-5xl rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-border/60 pb-4 mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ms-2 text-xs font-mono font-medium text-muted-foreground">
                  Live Interactive Onboarding Demo
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Speed: <span className="text-emerald-400 font-semibold">&lt; 5 minutes to launch</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Instant Train Form */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Globe className="h-4 w-4 text-accent" />
                  <span>Step 1: Enter Your Website URL</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Our crawler reads your pages, FAQs, hours, and services automatically.
                </p>
                <form onSubmit={handleSimulateCrawl} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="yourbusiness.com"
                    className="h-11 sm:h-9 text-base sm:text-xs w-full"
                  />
                  <Button type="submit" size="sm" disabled={isCrawling} className="shrink-0 gap-1.5 w-full sm:w-auto min-h-[44px] sm:min-h-0">
                    {isCrawling ? (
                      <>
                        <Zap className="h-3.5 w-3.5 animate-spin" /> Crawling...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Train Bot
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-2.5">
                <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Step 2: Instant Channels</span>
                  <Badge variant="success" className="text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
                  <div className="rounded-lg border border-border/60 bg-card p-2">
                    🌐 Website
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-2">
                    💬 WhatsApp
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-2">
                    📸 Instagram
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-background/50 p-4 space-y-2">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Zero Hallucination Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  If the bot doesn&apos;t know the answer from your data, it politely offers to take customer details rather than inventing false pricing.
                </p>
              </div>
            </div>

            {/* Right: Live Chatbox Preview */}
            <div className="lg:col-span-7 rounded-xl border border-border/70 bg-background flex flex-col h-[380px] shadow-inner">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-card/60 rounded-t-xl">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none">Apex Dental AI Assistant</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online • Typically replies in seconds
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Embeddable Widget
                </Badge>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground font-medium"
                          : "bg-secondary text-secondary-foreground border border-border/60"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Prompt Chips */}
              <div className="px-4 py-1.5 flex gap-1.5 overflow-x-auto border-t border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setChatMessage("Do you take Delta Dental insurance?");
                  }}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/20 whitespace-nowrap transition-colors"
                >
                  Do you take Delta Dental?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatMessage("How much is a teeth cleaning?");
                  }}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/20 whitespace-nowrap transition-colors"
                >
                  Cleaning prices?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatMessage("Can I book an appointment tomorrow?");
                  }}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/20 whitespace-nowrap transition-colors"
                >
                  Book appointment
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question as a customer..."
                  className="h-9 text-xs"
                />
                <Button type="submit" size="sm" className="h-9 px-3">
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
