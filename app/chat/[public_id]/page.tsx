"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  ChevronDown,
  Check,
  CheckCheck,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time?: string;
  status?: "sent" | "delivered" | "read";
  citations?: Array<{ title: string; snippet?: string }>;
  confidence?: number;
  feedback?: "up" | "down";
}

export default function PublicChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const publicId = (params?.public_id as string) || "demo-apex";
  const rawBrandParam = searchParams.get("brand");
  const customColor = searchParams.get("color");
  const customTextColor = searchParams.get("textColor");
  const isEmbedded = searchParams.get("embedded") === "true";

  // Dynamic brand name formatted from URL slug or param
  const brandName =
    rawBrandParam ||
    (publicId === "demo-apex"
      ? "Apex Dental Clinic"
      : publicId
          .replace(/^demo-/, "")
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "));

  const headerBgColor = customColor || "#2563eb";
  const headerTextColor = customTextColor || "#ffffff";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: `Hello! 👋 Welcome to ${brandName}. How can I assist you with services, pricing, or appointments today?`,
      time: "Just now",
      status: "read",
      confidence: 1.0,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Inline lead form state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, showLeadForm]);

  // Voice Input via Web Speech API
  const toggleVoiceRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-to-Speech Read Aloud
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speechActive) {
      setSpeechActive(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeechActive(false);
    utterance.onerror = () => setSpeechActive(false);
    setSpeechActive(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${publicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          session_id: "pub-session-" + (typeof window !== "undefined" ? window.name || "user" : "1"),
          history: newHistory.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();

      // Mark user message as delivered
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "delivered" } : m))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read",
          citations: data.citations,
          confidence: data.confidence,
        },
      ]);

      if (data.is_lead_triggered) {
        setShowLeadForm(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "We are ready to assist you with services and pricing! Would you like to schedule an appointment with our team?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (id: string, fb: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: fb } : m))
    );
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/chat/${publicId}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          requirements: "Submitted via chat assistant",
        }),
      });
    } catch {}
    setLeadCaptured(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-2xl mx-auto border-x border-border/40 shadow-2xl">
      {/* Header with dynamic Brand Name & Custom Accent Styling */}
      <header
        className="p-3.5 sm:p-4 border-b border-border/60 flex items-center justify-between sticky top-0 z-10 shadow-md transition-colors"
        style={{ backgroundColor: headerBgColor, color: headerTextColor }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight" style={{ color: headerTextColor }}>
              {brandName}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] opacity-90 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • Answers pricing instantly</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 border-none text-[10px]" style={{ color: headerTextColor }}>
            /{publicId}
          </Badge>
          {isEmbedded && (
            <button
              type="button"
              onClick={() => {
                if (window.parent) {
                  window.parent.postMessage("chatify:close", "*");
                }
              }}
              aria-label="Close chat"
              className="p-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white"
            >
              <span className="text-sm font-bold px-1">✕</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm bg-gradient-to-b from-card/30 to-background">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                m.sender === "user"
                  ? "bg-accent text-accent-foreground font-medium rounded-br-sm shadow-md"
                  : "bg-card text-foreground border border-border/70 rounded-bl-sm shadow-sm"
              }`}
            >
              {m.text}
            </div>

            {/* Messenger-style delivery receipt */}
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
              {m.time && <span>{m.time}</span>}
              {m.sender === "user" && m.status === "sent" && (
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Check className="h-3 w-3" /> Sent
                </span>
              )}
              {m.sender === "user" && m.status === "delivered" && (
                <span className="flex items-center gap-0.5 text-emerald-500 font-medium">
                  <CheckCheck className="h-3 w-3" /> Delivered
                </span>
              )}

              {/* Bot controls */}
              {m.sender === "bot" && (
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    type="button"
                    onClick={() => speakText(m.text)}
                    className="hover:text-foreground transition-colors p-0.5"
                    title="Read aloud"
                  >
                    {speechActive ? (
                      <VolumeX className="h-3 w-3 text-accent" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(m.id, "up")}
                    className={`hover:text-emerald-500 transition-colors p-0.5 ${
                      m.feedback === "up" ? "text-emerald-500 font-bold" : ""
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(m.id, "down")}
                    className={`hover:text-destructive transition-colors p-0.5 ${
                      m.feedback === "down" ? "text-destructive font-bold" : ""
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Facebook Messenger-style Typing Indicator */}
        {loading && (
          <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
            <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-card border border-border/80 px-4 py-2.5 shadow-sm flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground mr-1.5 font-medium">{brandName} is replying</span>
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Optional Lead Capture Form */}
        {showLeadForm && (
          <div className="rounded-xl border border-accent/40 bg-card p-4 shadow-lg space-y-3 animate-in fade-in">
            {leadCaptured ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <span>Thank you! Your details have been received and our team will get back to you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <span>Optional: Schedule Appointment or Request Callback</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    required
                    placeholder="Your Name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeadForm(false)}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    Maybe later
                  </Button>
                  <Button type="submit" size="sm" className="h-7 text-xs font-bold">
                    Confirm & Send
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <footer className="p-3 sm:p-4 border-t border-border/60 bg-card/90 backdrop-blur">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleVoiceRecording}
            className={`h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0 shrink-0 rounded-full transition-colors ${
              isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : ""
            }`}
            title="Voice input"
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${brandName} (e.g. Kitni price hai?)...`}
            className="h-11 sm:h-10 text-base sm:text-sm bg-background/90"
          />

          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0 shrink-0 rounded-full shadow-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: headerBgColor, color: headerTextColor }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Direct Answers First</span>
          </span>
          <a
            href="https://chatify.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-accent transition-colors"
          >
            <span>⚡ Made by</span>
            <span className="underline decoration-accent/60 underline-offset-2 font-bold text-accent">Chatify</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
