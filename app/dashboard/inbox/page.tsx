"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
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
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Power,
  ShieldAlert,
  Play,
  Sliders,
  Check,
  Activity,
  Globe,
  MousePointerClick,
  Eye,
  Navigation,
  ArrowUpRight,
  MessageSquare,
  Smartphone,
  Monitor,
  Laptop,
} from "lucide-react";
import type { ActiveVisitor, VisitorAction } from "@/app/api/tracking/events/route";

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

/**
 * Web Audio API Synthesizer for Visitor & Message Alarms
 */
function playAudioAlarm(tone: "chime" | "bell" | "ping" = "chime", volume: number = 0.5) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = volume;

    if (tone === "bell") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    } else if (tone === "ping") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
    } else {
      // Pleasant dual chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(830.61, ctx.currentTime + 0.15); // G#5
    }

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn("Audio alarm playback notice:", e);
  }
}

export default function UnifiedInboxPage() {
  const { activeWorkspace } = useWorkspace();
  const isDemo = activeWorkspace.id === "ws-demo-001";

  // Global AI Master Switch (Turn off ALL AI when agent is available to reply manually)
  const [globalAiActive, setGlobalAiActive] = useState<boolean>(true);

  // Sound Alarm Settings
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmTone, setAlarmTone] = useState<"chime" | "bell" | "ping">("chime");
  const [alarmVolume, setAlarmVolume] = useState(0.6);
  const [showAlarmConfig, setShowAlarmConfig] = useState(false);
  const [visitorAlertBanner, setVisitorAlertBanner] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    if (isDemo) {
      return [
        {
          id: "conv-1",
          name: "Michael Torres",
          contact: "+1 (555) 392-1084",
          channel: "whatsapp",
          status: "active",
          sentiment: "booking",
          lastMessage: "Do you have an opening for consultation tomorrow morning?",
          time: "4m ago",
          unread: true,
          notes: "Patient asks about morning consultation slot.",
          messages: [
            { sender: "user", text: "Hi, I have a quick question.", time: "2:40 PM" },
            { sender: "bot", text: "Hello! We are here to help. How can I assist you today?", time: "2:40 PM" },
            { sender: "user", text: "Do you have an opening for consultation tomorrow morning?", time: "2:41 PM" },
            { sender: "bot", text: "Yes! We have an opening tomorrow at 10:30 AM. Can I reserve this for you?", time: "2:41 PM" },
          ],
        },
      ];
    }
    try {
      const saved = localStorage.getItem(`chatify_conversations_${activeWorkspace.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [selectedId, setSelectedId] = useState("conv-1");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [internalNoteText, setInternalNoteText] = useState("");

  // Tab View Mode: Conversations Inbox vs Live Website Visitors Radar
  const [activeTab, setActiveTab] = useState<"inbox" | "radar">("inbox");
  const [activeVisitors, setActiveVisitors] = useState<ActiveVisitor[]>([]);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>("cty_v_8921");
  const [isSimulatingEvent, setIsSimulatingEvent] = useState(false);

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0] || null;

  // Poll live website telemetry events every 3.5s
  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/tracking/events");
        const data = await res.json();
        if (isMounted && data.ok) {
          setActiveVisitors(data.visitors || []);
          if (data.hasNewArrival) {
            const arr = data.latestArrival;
            const arrivalMsg = `🔔 New Visitor Landed! ${arr?.id || "Visitor"} arrived on ${arr?.currentPage || "/"} from ${arr?.referrer || "Direct"} (${arr?.device || "Desktop"})`;
            setVisitorAlertBanner(arrivalMsg);
            if (alarmEnabled) {
              playAudioAlarm(alarmTone, alarmVolume);
            }
            if (arr?.id) {
              fetch(`/api/tracking/events?ack=${arr.id}`);
            }
          }
        }
      } catch (e) {}
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [alarmEnabled, alarmTone, alarmVolume]);

  const selectedVisitor =
    activeVisitors.find((v) => v.id === selectedVisitorId) || activeVisitors[0] || null;

  // Simulate real-time click or page navigation for testing
  const handleSimulateVisitorEvent = async (actionType: "click" | "page_view" | "section_view") => {
    setIsSimulatingEvent(true);
    try {
      const vid = selectedVisitor?.id || "cty_v_8921";
      let payload: any = {
        visitorId: vid,
        eventType: actionType,
      };

      if (actionType === "click") {
        payload.elementText = "Book $95 Checkup Special";
        payload.elementTag = "button";
        payload.pathname = "/pricing";
        payload.section = "#pricing-table";
      } else if (actionType === "page_view") {
        payload.pathname = "/booking";
        payload.title = "Schedule Dental Appointment Online";
        payload.section = "#calendar-view";
      } else {
        payload.section = "#customer-reviews";
        payload.pathname = "/services";
      }

      await fetch("/api/tracking/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Refetch
      const res = await fetch("/api/tracking/events");
      const data = await res.json();
      if (data.ok) {
        setActiveVisitors(data.visitors || []);
      }
    } catch {} finally {
      setIsSimulatingEvent(false);
    }
  };

  // Initiate proactive chat with visitor
  const handleInitiateProactiveChat = (visitor: ActiveVisitor) => {
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationItem = {
      id: newId,
      name: `Visitor (${visitor.id})`,
      contact: `${visitor.device} • ${visitor.currentPage}`,
      channel: "web",
      status: "human_takeover",
      sentiment: "sales",
      lastMessage: `Operator initiated proactive chat on ${visitor.currentPage}`,
      time: "Just now",
      unread: false,
      notes: `Landed from ${visitor.referrer}. Last section viewed: ${visitor.currentSection || "None"}.`,
      messages: [
        {
          sender: "agent",
          text: `Hi there! I noticed you are viewing our ${visitor.currentPage} page. Can I answer any pricing or booking questions for you?`,
          time: "Just now",
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newId);
    setActiveTab("inbox");
  };

  // Test Alarm Chime
  const handleTestAlarm = () => {
    playAudioAlarm(alarmTone, alarmVolume);
  };

  // Simulate new customer arrival with sound alarm
  const handleSimulateVisitorArrival = () => {
    const visitorName = "Robert Chen (New Visitor)";
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationItem = {
      id: newId,
      name: visitorName,
      contact: "Web Visitor #419",
      channel: "web",
      status: globalAiActive ? "active" : "human_takeover",
      sentiment: "sales",
      lastMessage: "Hi, I just arrived on your website. What are your teeth cleaning prices?",
      time: "Just now",
      unread: true,
      messages: [
        {
          sender: "user",
          text: "Hi, I just arrived on your website. What are your teeth cleaning prices?",
          time: "Just now",
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newId);

    // Trigger audible alarm if enabled
    if (alarmEnabled) {
      playAudioAlarm(alarmTone, alarmVolume);
    }

    setVisitorAlertBanner(`🔔 New visitor "${visitorName}" arrived on website! Alarm sounded.`);
    setTimeout(() => setVisitorAlertBanner(null), 8000);
  };

  // Toggle Human Takeover for THIS chat only
  const handleToggleTakeoverForCurrentChat = () => {
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

  // Master switch: Toggle ALL AI on/off
  const handleToggleMasterAi = () => {
    const nextState = !globalAiActive;
    setGlobalAiActive(nextState);

    // If turned off, mark all active conversations as human takeover
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        status: nextState ? "active" : "human_takeover",
      }))
    );
  };

  // Send Human Reply (Automatically pauses AI for this conversation)
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            status: "human_takeover",
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
    <div className="space-y-4">
      {/* Top Controls Bar: Master AI Toggle & Alarm Config */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Master 1-Button AI Switch */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleMasterAi}
              size="sm"
              className={`h-9 text-xs font-bold gap-2 transition-all ${
                globalAiActive
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              }`}
            >
              <Power className="h-4 w-4" />
              <span>
                {globalAiActive ? "Global AI Auto-Pilot: ON" : "⏸️ Master AI Paused (Human Replying)"}
              </span>
            </Button>

            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {globalAiActive
                ? "AI handles all incoming chats 24/7."
                : "All AI disabled across all chats. You reply manually."}
            </span>
          </div>
        </div>

        {/* Right: Sound Alarm & Notification Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateVisitorArrival}
            className="h-8 text-xs gap-1.5 border-dashed border-accent/60 text-accent font-semibold"
          >
            <BellRing className="h-3.5 w-3.5 animate-bounce" />
            <span>Simulate Visitor Arrival</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlarmConfig(!showAlarmConfig)}
            className={`h-8 text-xs gap-1.5 ${alarmEnabled ? "text-foreground" : "text-muted-foreground"}`}
          >
            {alarmEnabled ? <Volume2 className="h-3.5 w-3.5 text-accent" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Visitor Alarm: {alarmEnabled ? "ON" : "OFF"}</span>
          </Button>
        </div>
      </div>

      {/* Alarm Configuration Popover */}
      {showAlarmConfig && (
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" />
              <h3 className="text-xs font-bold text-foreground">Visitor Arrival Sound Alarm Settings</h3>
            </div>
            <button
              onClick={() => setShowAlarmConfig(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Toggle Alarm */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Sound Alert</label>
              <button
                type="button"
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-between ${
                  alarmEnabled
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <span>Ring on New Visitor</span>
                <span>{alarmEnabled ? "Enabled ✓" : "Disabled"}</span>
              </button>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Alarm Sound Tone</label>
              <select
                value={alarmTone}
                onChange={(e) => setAlarmTone(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs font-medium"
              >
                <option value="chime">Pleasant Hotel Chime (Dual Tone)</option>
                <option value="bell">Reception Counter Bell</option>
                <option value="ping">Urgent Customer Ping</option>
              </select>
            </div>

            {/* Test button */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Audio Test</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestAlarm}
                className="w-full h-9 text-xs gap-1.5 font-bold"
              >
                <Volume2 className="h-3.5 w-3.5 text-accent" />
                <span>Test Alarm Chime</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Arrival Banner Alert */}
      {visitorAlertBanner && (
        <div className="rounded-xl border border-accent/40 bg-accent/15 p-3 text-xs text-foreground flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold">
            <BellRing className="h-4 w-4 text-accent animate-pulse" />
            <span>{visitorAlertBanner}</span>
          </div>
          <button
            onClick={() => setVisitorAlertBanner(null)}
            className="text-xs text-muted-foreground hover:text-foreground font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tab Bar: Conversations vs Live Website Visitors Radar */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "inbox"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Customer Conversations</span>
          <Badge variant="outline" className="text-[10px] bg-background/50 border-none font-mono">
            {conversations.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("radar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "radar"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>Live Website Visitors Radar</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-none font-mono">
            {activeVisitors.length} Online
          </Badge>
        </button>
      </div>

      {/* VIEW 1: Main Inbox 3-Pane Container */}
      {activeTab === "inbox" && (
        conversations.length === 0 || !activeConv ? (
          <div className="rounded-2xl border border-border/70 bg-card p-12 text-center space-y-4 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-1">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Clean Unified Inbox • {activeWorkspace.name}</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                No customer inquiries yet. When visitors send a message via your Website widget, WhatsApp, or Instagram, their chats will stream here with sentiment analysis and human takeover controls.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateVisitorArrival}
                className="h-9 text-xs font-semibold gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Simulate First Customer Inquiry</span>
              </Button>
            </div>
          </div>
        ) : (
      <div className="h-auto min-h-[680px] md:h-[calc(100vh-16rem)] flex flex-col md:flex-row rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        {/* Pane 1: Conversations List (Left) */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border/60 flex flex-col bg-background/50 max-h-56 md:max-h-none shrink-0">
          {/* Search & Channel Filter */}
          <div className="p-3 border-b border-border/40 space-y-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-3.5 sm:top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="h-11 sm:h-8 pl-8 text-base sm:text-xs bg-background"
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
                      ? "bg-foreground text-background font-bold shadow-sm"
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
                const isHuman = c.status === "human_takeover";

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full p-3.5 text-left flex flex-col gap-1 transition-colors ${
                      isSelected ? "bg-secondary/70 border-l-2 border-accent" : "hover:bg-secondary/20"
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
                      {isHuman ? (
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          👤 Human Control
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                          <Bot className="h-3 w-3" /> AI Active
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground line-clamp-1 mt-0.5">
                      {c.lastMessage}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Pane 2: Active Chat Feed (Middle) */}
        <div className="flex-1 flex flex-col bg-background/30">
          {/* Header of Active Chat */}
          <div className="p-3.5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                {activeConv.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-foreground">{activeConv.name}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {activeConv.channel}
                  </Badge>
                  {activeConv.status === "human_takeover" ? (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                      👤 Human In Control (AI Off)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                      🤖 AI Auto-Pilot ON
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  {activeConv.contact}
                </div>
              </div>
            </div>

            {/* Per-Chat Takeover Button (Stop AI for this specific chat) */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeConv.status === "human_takeover" ? "outline" : "default"}
                size="sm"
                onClick={handleToggleTakeoverForCurrentChat}
                className={`h-8 text-xs font-bold gap-1.5 shadow-sm ${
                  activeConv.status === "human_takeover"
                    ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
              >
                {activeConv.status === "human_takeover" ? (
                  <>
                    <Bot className="h-3.5 w-3.5" />
                    <span>Resume AI for This Chat</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-3.5 w-3.5" />
                    <span>Turn OFF AI for This Chat</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Status Alert Banner for Current Chat */}
          {activeConv.status === "human_takeover" && (
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-500 flex items-center justify-between font-medium">
              <span>⚠️ AI is currently OFF for this customer. You are in direct human control.</span>
              <button
                onClick={handleToggleTakeoverForCurrentChat}
                className="underline font-bold text-[11px] hover:text-amber-400"
              >
                Resume AI Auto-Pilot
              </button>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {activeConv.messages.map((m, idx) => {
              const isUser = m.sender === "user";
              const isAgent = m.sender === "agent";

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 px-1">
                    {isUser && <span>Customer</span>}
                    {isAgent && <span className="font-bold text-accent">You (Operator)</span>}
                    {m.sender === "bot" && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <Bot className="h-3 w-3" /> AI Receptionist
                      </span>
                    )}
                    <span>• {m.time}</span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-card border border-border/70 text-foreground"
                        : isAgent
                        ? "bg-accent text-accent-foreground font-medium"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Reply Bar */}
          <form onSubmit={handleSendReply} className="p-3 border-t border-border/40 bg-card flex gap-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply as human operator..."
              className="h-11 sm:h-9 text-base sm:text-xs bg-background"
            />
            <Button type="submit" size="sm" className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 text-xs font-bold gap-1 px-4 shrink-0">
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>

        {/* Pane 3: Customer Details & Internal Notes (Right) */}
        <div className="w-full md:w-72 border-l border-border/60 p-4 space-y-4 bg-background/50 overflow-y-auto hidden lg:block text-xs">
          <div>
            <h4 className="font-bold text-foreground text-xs">Customer Profile</h4>
            <div className="mt-2 space-y-2 bg-card rounded-xl p-3 border border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold text-foreground">{activeConv.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-mono text-foreground">{activeConv.contact}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Channel:</span>
                <span className="capitalize text-foreground">{activeConv.channel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Intent:</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {activeConv.sentiment}
                </Badge>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <StickyNote className="h-3.5 w-3.5 text-accent" />
              <span>Internal Staff Notes</span>
            </div>
            <Textarea
              rows={3}
              value={internalNoteText || activeConv.notes || ""}
              onChange={(e) => setInternalNoteText(e.target.value)}
              placeholder="Add private staff note (e.g. Patient prefers morning appointments)..."
              className="text-xs bg-card"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSaveNotes}
              className="w-full h-7 text-xs font-semibold"
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>
        )
      )}

      {/* VIEW 2: Live Website Visitors Radar & Action Tracker */}
      {activeTab === "radar" && (
        <div className="h-[calc(100vh-16rem)] flex flex-col md:flex-row rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm animate-in fade-in">
          {/* Left Pane: Active Visitors List */}
          <div className="w-full md:w-80 border-r border-border/60 flex flex-col bg-background/50">
            <div className="p-3.5 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-foreground">Active Visitors ({activeVisitors.length})</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/40">
                Live Telemetry
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {activeVisitors.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Waiting for website visitors... Embed the script tag on your website to start tracking.
                </div>
              ) : (
                activeVisitors.map((v) => {
                  const isSelected = selectedVisitor?.id === v.id;
                  const isMobile = v.device.toLowerCase().includes("mobile") || v.device.toLowerCase().includes("iphone");
                  const isTablet = v.device.toLowerCase().includes("tablet") || v.device.toLowerCase().includes("ipad");

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVisitorId(v.id)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-accent/15 border-l-4 border-accent shadow-sm"
                          : "hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isMobile ? (
                            <Smartphone className="h-4 w-4 text-accent" />
                          ) : isTablet ? (
                            <Laptop className="h-4 w-4 text-purple-400" />
                          ) : (
                            <Monitor className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="text-xs font-bold text-foreground">{v.id}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{v.device}</span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground font-mono">
                        <span className="text-muted-foreground">Page:</span>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                          {v.currentPage}
                        </Badge>
                      </div>

                      {v.currentSection && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          Section: <span className="text-foreground">{v.currentSection}</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          {v.hasUsedChat ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Bot className="h-3 w-3" /> Chatbot Active
                            </span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Browsing Only
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground font-mono">{v.ipMasked}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Selected Visitor Live Journey & Detail */}
          {selectedVisitor ? (
            <div className="flex-1 flex flex-col bg-background/30 overflow-y-auto">
              {/* Header with Visitor Telemetry Meta */}
              <div className="p-4 border-b border-border/40 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      Visitor Journey: <span className="font-mono text-accent">{selectedVisitor.id}</span>
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40 font-mono">
                      Online Now
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>Device: <strong className="text-foreground">{selectedVisitor.browser}</strong></span>
                    <span>•</span>
                    <span>Referrer: <strong className="text-foreground">{selectedVisitor.referrer}</strong></span>
                    <span>•</span>
                    <span>Masked IP: <strong className="text-foreground font-mono">{selectedVisitor.ipMasked}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleInitiateProactiveChat(selectedVisitor)}
                    size="sm"
                    className="h-8 text-xs font-bold gap-1.5 bg-accent text-accent-foreground shadow-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Initiate Proactive Chat</span>
                  </Button>
                </div>
              </div>

              {/* Current Page & Real-Time Location Card */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Current Page
                    </span>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                      <Globe className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="truncate">{selectedVisitor.currentPage}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{selectedVisitor.currentTitle}</div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Active Section Viewed
                    </span>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                      <Eye className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{selectedVisitor.currentSection || "Page Header / Hero"}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Scroll depth captured in real-time</div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Chat Interaction
                    </span>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{selectedVisitor.hasUsedChat ? "Chatbot Opened" : "Browsing (No Chat Yet)"}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {selectedVisitor.hasUsedChat ? "Customer engaged with bot" : "Tracked without chatbot interaction"}
                    </div>
                  </div>
                </div>

                {/* Simulation Test Controls for Live Verification */}
                <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Verify Real-Time Telemetry:</strong> Simulate live visitor navigation or CTA button clicks.
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSimulatingEvent}
                      onClick={() => handleSimulateVisitorEvent("click")}
                      className="h-7 text-xs font-semibold gap-1"
                    >
                      <MousePointerClick className="h-3 w-3 text-accent" />
                      <span>Simulate Button Click</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSimulatingEvent}
                      onClick={() => handleSimulateVisitorEvent("page_view")}
                      className="h-7 text-xs font-semibold gap-1"
                    >
                      <Navigation className="h-3 w-3 text-emerald-400" />
                      <span>Simulate Page Nav</span>
                    </Button>
                  </div>
                </div>

                {/* Live Visitor Action Stream (Breadcrumbs & Timeline) */}
                <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-accent" />
                      <span>Real-Time Visitor Journey Timeline ({selectedVisitor.actions.length} steps)</span>
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-mono">Updated every 3.5s</span>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                    {selectedVisitor.actions.map((act, index) => {
                      const isClick = act.type === "click";
                      const isArrival = act.type === "arrival";
                      const isSection = act.type === "section_view";
                      const isPage = act.type === "page_view";

                      return (
                        <div key={act.id || index} className="relative group">
                          {/* Dot Icon */}
                          <div
                            className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                              isArrival
                                ? "bg-blue-500 text-white"
                                : isClick
                                ? "bg-amber-500 text-white"
                                : isSection
                                ? "bg-purple-500 text-white"
                                : "bg-emerald-500 text-white"
                            }`}
                          >
                            {isArrival && <Globe className="h-2.5 w-2.5" />}
                            {isClick && <MousePointerClick className="h-2.5 w-2.5" />}
                            {isSection && <Eye className="h-2.5 w-2.5" />}
                            {isPage && <Navigation className="h-2.5 w-2.5" />}
                          </div>

                          <div className="bg-secondary/20 hover:bg-secondary/40 transition-colors p-3 rounded-xl border border-border/50 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground">{act.description}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{act.timestamp}</span>
                            </div>

                            <div className="text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
                              <span>Path: <strong className="text-foreground font-mono">{act.pathname}</strong></span>
                              {act.section && <span>Section: <strong className="text-foreground">{act.section}</strong></span>}
                              {act.elementText && <span>Element: <strong className="text-accent">&ldquo;{act.elementText}&rdquo;</strong></span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-muted-foreground">
              Select a visitor from the left to view their live journey path.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
