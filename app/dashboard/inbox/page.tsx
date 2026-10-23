"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  UserCheck,
  UserX,
  Search,
  Filter,
  Bot,
  User,
  Phone,
  Mail,
  StickyNote,
  Tag,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface ConversationItem {
  id: string;
  name: string;
  contact: string;
  channel: "web" | "whatsapp" | "instagram" | "messenger";
  status: "active" | "human_takeover" | "resolved";
  sentiment: "sales" | "booking" | "support" | "complaint";
  lastMessage: string;
  time: string;
  unread: boolean;
  notes?: string;
  messages: Array<{ sender: "user" | "bot" | "agent"; text: string; time: string }>;
}

export default function UnifiedInboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([
    {
      id: "conv-1",
      name: "Michael Torres",
      contact: "+1 (555) 392-1084",
      channel: "whatsapp",
      status: "active",
      sentiment: "booking",
      lastMessage: "Do you have an opening for root canal consultation tomorrow morning?",
      time: "4m ago",
      unread: true,
      notes: "Patient mentions toothache in lower molar since yesterday.",
      messages: [
        { sender: "user", text: "Hi, I have severe tooth pain.", time: "2:40 PM" },
        { sender: "bot", text: "Hello! We are here to help. Are you looking for emergency dental relief or an urgent consultation?", time: "2:40 PM" },
        { sender: "user", text: "Do you have an opening for root canal consultation tomorrow morning?", time: "2:41 PM" },
        { sender: "bot", text: "Yes! Dr. Sarah has an emergency slot open tomorrow at 10:30 AM. Can I reserve this for you?", time: "2:41 PM" },
      ],
    },
    {
      id: "conv-2",
      name: "Sarah Jenkins",
      contact: "sarah.j@gmail.com",
      channel: "web",
      status: "active",
      sentiment: "support",
      lastMessage: "What are your emergency care hours on Saturday?",
      time: "18m ago",
      unread: false,
      messages: [
        { sender: "user", text: "What are your emergency care hours on Saturday?", time: "2:26 PM" },
        { sender: "bot", text: "We are open for emergency appointments on Saturday from 9:00 AM to 2:00 PM.", time: "2:26 PM" },
      ],
    },
    {
      id: "conv-3",
      name: "David Vance",
      contact: "+1 (555) 781-9923",
      channel: "instagram",
      status: "human_takeover",
      sentiment: "booking",
      lastMessage: "Thank you Jessica, I will see you on Tuesday at 2 PM.",
      time: "1h ago",
      unread: false,
      notes: "Taken over by front desk receptionist Jessica.",
      messages: [
        { sender: "user", text: "Can I reschedule my crown fitting?", time: "1:15 PM" },
        { sender: "bot", text: "I can assist with that. What day works best?", time: "1:15 PM" },
        { sender: "agent", text: "Hi David, this is Jessica from the front desk! I have moved you to Tuesday at 2 PM.", time: "1:22 PM" },
        { sender: "user", text: "Thank you Jessica, I will see you on Tuesday at 2 PM.", time: "1:24 PM" },
      ],
    },
  ]);

  const [selectedId, setSelectedId] = useState("conv-1");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [internalNoteText, setInternalNoteText] = useState("");

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  const handleToggleTakeover = () => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          const nextStatus = c.status === "human_takeover" ? "active" : "human_takeover";
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            status: "human_takeover", // Replying manually automatically pauses the bot
            messages: [
              ...c.messages,
              { sender: "agent", text: replyText, time: "Just now" },
            ],
            lastMessage: replyText,
          };
        }
        return c;
      })
    );
    setReplyText("");
  };

  const handleSaveNotes = () => {
    if (!internalNoteText.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, notes: internalNoteText } : c))
    );
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
      {/* Pane 1: Conversations List (Left) */}
      <div className="w-full md:w-80 border-r border-border/60 flex flex-col bg-background/50">
        {/* Search & Channel Filter */}
        <div className="p-3 border-b border-border/40 space-y-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto text-[11px]">
            {["all", "whatsapp", "web", "instagram"].map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setFilterChannel(ch)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  filterChannel === ch
                    ? "bg-foreground text-background font-bold"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/30 text-xs">
          {conversations
            .filter((c) => filterChannel === "all" || c.channel === filterChannel)
            .map((c) => {
              const isSelected = c.id === activeConv.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full p-3.5 text-left flex flex-col gap-1 transition-colors ${
                    isSelected ? "bg-secondary/60" : "hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Badge variant="outline" className="py-0 px-1 text-[9px] uppercase">
                      {c.channel}
                    </Badge>
                    {c.status === "human_takeover" ? (
                      <Badge variant="warning" className="py-0 px-1 text-[9px]">
                        Human Takeover
                      </Badge>
                    ) : (
                      <Badge variant="success" className="py-0 px-1 text-[9px]">
                        Bot Answering
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {c.lastMessage}
                  </p>
                </button>
              );
            })}
        </div>
      </div>

      {/* Pane 2: Active Chat Viewport (Middle) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{activeConv.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{activeConv.contact}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Channel: <strong className="capitalize text-foreground">{activeConv.channel}</strong></span>
              <span>•</span>
              <span>Intent: <strong className="capitalize text-emerald-400">{activeConv.sentiment}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeConv.status === "human_takeover" ? "default" : "outline"}
              onClick={handleToggleTakeover}
              className="h-8 text-xs gap-1.5"
            >
              {activeConv.status === "human_takeover" ? (
                <>
                  <Bot className="h-3.5 w-3.5" /> Return to Bot
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-accent" /> Human Takeover
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {activeConv.messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "user" ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                  m.sender === "user"
                    ? "bg-secondary text-secondary-foreground border border-border/60"
                    : m.sender === "agent"
                    ? "bg-accent text-accent-foreground font-medium"
                    : "bg-primary text-primary-foreground font-medium"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                {m.sender === "agent" ? "Staff Agent" : m.sender === "bot" ? "AI Assistant" : "Customer"} • {m.time}
              </span>
            </div>
          ))}
        </div>

        {/* Reply Input Bar */}
        <form onSubmit={handleSendReply} className="p-3 border-t border-border/40 bg-card/40 flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response to the customer (bot will pause)..."
            className="h-9 text-xs"
          />
          <Button type="submit" size="sm" className="h-9 px-4 text-xs gap-1.5 shadow-sm">
            <Send className="h-3.5 w-3.5" />
            <span>Reply</span>
          </Button>
        </form>
      </div>

      {/* Pane 3: Customer Details & Internal Notes (Right) */}
      <div className="w-72 border-l border-border/60 p-4 bg-card/30 flex flex-col gap-4 text-xs hidden lg:flex">
        <div>
          <div className="font-bold text-foreground text-sm">Customer Profile</div>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5 text-foreground" />
              <span>{activeConv.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-foreground" />
              <span>{activeConv.contact}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-3 space-y-2">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <StickyNote className="h-3.5 w-3.5 text-accent" />
            <span>Staff Internal Notes</span>
          </div>
          <Textarea
            rows={4}
            value={internalNoteText || activeConv.notes || ""}
            onChange={(e) => setInternalNoteText(e.target.value)}
            placeholder="Add a private note visible only to your team..."
            className="text-xs"
          />
          <Button size="sm" variant="outline" onClick={handleSaveNotes} className="w-full h-7 text-xs">
            Save Note
          </Button>
        </div>
      </div>
    </div>
  );
}
