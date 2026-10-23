"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  citations?: Array<{ title: string; snippet?: string }>;
  confidence?: number;
  feedback?: "up" | "down";
}

export default function PublicChatPage() {
  const params = useParams();
  const publicId = (params?.public_id as string) || "demo-apex";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: "Hello! 👋 Welcome to Apex Dental Clinic. How can I assist you with your dental care or appointment today?",
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
  }, [messages, showLeadForm]);

  // Voice Input via Web Speech API (Free in all modern browsers)
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

  // Text-to-Speech Read Aloud (Free via browser SpeechSynthesis)
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
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.answer,
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
          text: "Yes, we accept Delta Dental and MetLife insurance plans! Would you like to schedule an appointment with our team?",
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
      {/* Header */}
      <header className="p-4 border-b border-border/60 bg-card/80 backdrop-blur flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Apex Dental Assistant</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • Typically replies in seconds</span>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          24/7 Verified AI
        </Badge>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm">
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
                  ? "bg-primary text-primary-foreground font-medium rounded-br-none shadow-sm"
                  : "bg-secondary text-secondary-foreground border border-border/60 rounded-bl-none shadow-sm"
              }`}
            >
              {m.text}
            </div>

            {/* Bot Controls: Voice Read-Aloud & Thumbs Feedback */}
            {m.sender === "bot" && (
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground px-1">
                <button
                  type="button"
                  onClick={() => speakText(m.text)}
                  className="hover:text-foreground transition-colors p-1"
                  title="Read aloud"
                >
                  {speechActive ? (
                    <VolumeX className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(m.id, "up")}
                  className={`hover:text-emerald-400 transition-colors p-1 ${
                    m.feedback === "up" ? "text-emerald-400" : ""
                  }`}
                  title="Helpful answer"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(m.id, "down")}
                  className={`hover:text-destructive transition-colors p-1 ${
                    m.feedback === "down" ? "text-destructive" : ""
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Inline Lead Capture Trigger Form */}
        {showLeadForm && (
          <div className="rounded-xl border border-accent/40 bg-card p-4 shadow-lg space-y-3">
            {leadCaptured ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Thank you! Our front desk team has received your inquiry and will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Leave your details for quick confirmation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="h-8 text-xs"
                  />
                  <Input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Phone Number (e.g. 555-123-4567)"
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="h-8 text-xs flex-1"
                  />
                  <Button type="submit" size="sm" className="h-8 text-xs shrink-0 font-semibold">
                    Confirm Callback
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-border/40 bg-card/40 flex gap-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setInput("Do you accept Delta Dental insurance?")}
          className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
        >
          Delta Dental accepted?
        </button>
        <button
          type="button"
          onClick={() => setInput("How much is a teeth cleaning?")}
          className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
        >
          Cleaning cost?
        </button>
        <button
          type="button"
          onClick={() => setInput("Can I book an appointment tomorrow?")}
          className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
        >
          Book appointment
        </button>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-border/60 bg-card/60 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`h-9 w-9 rounded-md flex items-center justify-center transition-colors border ${
            isRecording
              ? "bg-red-500 text-white border-red-600 animate-pulse"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          title="Voice input"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "Listening to your voice..." : "Type your message..."}
          className="h-10 text-xs flex-1"
        />

        <Button type="submit" size="sm" disabled={loading} className="h-10 px-4 text-xs gap-1.5 shadow-sm">
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
