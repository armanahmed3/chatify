"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "./workspace-provider";
import {
  Bot,
  LayoutDashboard,
  BrainCircuit,
  Inbox,
  UserCheck,
  BarChart3,
  Share2,
  Settings,
  CreditCard,
  Building2,
  ChevronDown,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  MessageSquareQuote,
  HelpCircle,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkle,
  X,
  Plus,
  Check,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  title: string;
  items: {
    label: string;
    proLabel?: string;
    href: string;
    icon: any;
    badge?: string;
    highlight?: boolean;
  }[];
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const {
    activeWorkspace,
    workspaces,
    setActiveWorkspace,
    createWorkspace,
    logout,
    uiMode,
    setUiMode,
    toggleUiMode,
    setIsTestDrawerOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useWorkspace();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [botOnline, setBotOnline] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Lock body scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const sections: NavSection[] = [
    {
      title: "Core",
      items: [
        {
          label: "Overview",
          proLabel: "Console Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Customer Leads",
          proLabel: "Captured Leads & CRM",
          href: "/dashboard/leads",
          icon: UserCheck,
          badge: "New",
          highlight: true,
        },
        {
          label: "Live Inbox & Radar",
          proLabel: "Omnichannel Inbox & RT",
          href: "/dashboard/inbox",
          icon: Inbox,
          badge: "Live",
          highlight: true,
        },
      ],
    },
    {
      title: "AI Training & Bot",
      items: [
        {
          label: "Chatbot Setup",
          proLabel: "Bot Prompt & Studio",
          href: "/dashboard/chatbots",
          icon: Bot,
        },
        {
          label: "Knowledge & Website",
          proLabel: "RAG & Vector Sources",
          href: "/dashboard/training",
          icon: BrainCircuit,
        },
        {
          label: "Business Templates",
          proLabel: "Industry Presets",
          href: "/dashboard/templates",
          icon: Building2,
        },
      ],
    },
    {
      title: "Growth & Channels",
      items: [
        {
          label: "WhatsApp & Channels",
          proLabel: "Meta Graph & Webhooks",
          href: "/dashboard/channels",
          icon: Share2,
        },
        {
          label: "ROI & Analytics",
          proLabel: "Conversion & Metrics",
          href: "/dashboard/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          label: "Settings & Team",
          proLabel: "Config & API Keys",
          href: "/dashboard/settings",
          icon: Settings,
        },
        {
          label: "Billing & Plans",
          proLabel: "Subscription & Limits",
          href: "/dashboard/billing",
          icon: CreditCard,
        },
      ],
    },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div>
        {/* Workspace Brand Switcher & Profile Dropdown */}
        <div className="p-4 border-b border-border/40 relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-full flex items-center justify-between rounded-xl border border-border/70 bg-background/90 p-2.5 shadow-sm hover:border-accent/60 hover:bg-accent/5 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-[44px]"
            aria-expanded={isProfileOpen}
            aria-label="Toggle Clinic Profile Menu"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs shadow-sm ring-1 ring-white/10"
                style={{ backgroundColor: activeWorkspace.accent_color || "#2563eb" }}
              >
                {activeWorkspace.name.charAt(0)}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                  <span>{activeWorkspace.name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      botOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    )}
                  />
                  <span className={botOnline ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                    {botOnline ? "Bot Online (24/7)" : "Bot Paused"}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                isProfileOpen ? "rotate-180 text-foreground" : ""
              )}
            />
          </button>

          {/* Interactive Profile & Practice Dropdown Popover */}
          {isProfileOpen && (
            <div className="absolute left-4 right-4 top-full mt-2 z-50 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3 max-h-[85vh] overflow-y-auto">
              {/* Practice Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div>
                  <div className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <span>{activeWorkspace.name}</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    /{activeWorkspace.slug}
                  </div>
                </div>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                  7-Day Trial
                </span>
              </div>

              {/* Multi-Dashboard: Workspace Switcher */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Your Practices & Workspaces</span>
                  <span className="text-foreground">{workspaces.length}</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                  {workspaces.map((ws) => {
                    const isCurrent = ws.id === activeWorkspace.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setIsProfileOpen(false);
                          if (isMobile) setIsMobileSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all text-left min-h-[38px]",
                          isCurrent
                            ? "bg-accent/15 text-accent border border-accent/30 font-bold"
                            : "hover:bg-secondary/70 text-foreground border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: ws.accent_color || "#2563eb" }}
                          />
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Workspace Inline Flow */}
                {isAddingWorkspace ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newWsName.trim()) {
                        createWorkspace(newWsName.trim());
                        setNewWsName("");
                        setIsAddingWorkspace(false);
                      }
                    }}
                    className="pt-1 space-y-1.5"
                  >
                    <input
                      type="text"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      placeholder="e.g. Westside Clinic"
                      autoFocus
                      required
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-border/70 bg-background text-foreground"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="submit"
                        className="flex-1 h-7 rounded-md bg-accent text-accent-foreground text-[11px] font-bold"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingWorkspace(false)}
                        className="h-7 px-2 rounded-md hover:bg-secondary text-[11px] text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingWorkspace(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-accent hover:bg-accent/10 rounded-lg transition-colors border border-dashed border-accent/30 min-h-[36px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Another Practice / Dashboard</span>
                  </button>
                )}
              </div>

              {/* Bot 24/7 Switch */}
              <div className="flex items-center justify-between bg-card rounded-xl p-2.5 border border-border/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Autonomous AI Reception</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {botOnline ? "Answering visitors 24/7" : "Manual operator only"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBotOnline((prev) => !prev)}
                  className="text-foreground hover:text-accent transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Toggle autonomous bot status"
                >
                  {botOnline ? (
                    <ToggleRight className="h-7 w-7 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Quick Practice Details */}
              <div className="space-y-1.5 text-[11px] text-muted-foreground pt-0.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-accent" /> Practice Phone:
                  </span>
                  <span className="font-mono text-foreground font-semibold">
                    {(activeWorkspace as any).phone || "+1 (555) 382-9901"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-emerald-400" /> Working Hours:
                  </span>
                  <span className="text-foreground font-medium">Mon-Sat 8am-6pm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-indigo-400" /> Trial Status:
                  </span>
                  <span className="text-emerald-400 font-semibold">7-Day Free Trial Active</span>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-border/60 space-y-1">
                <Link
                  href={`/chat/${activeWorkspace.slug}?brand=${encodeURIComponent(activeWorkspace.name)}`}
                  target="_blank"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (isMobile) setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent/10 transition-colors min-h-[38px]"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    <span>View Public Chat Widget</span>
                  </span>
                  <span className="text-[9px] text-accent font-bold">Open ↗</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (isMobile) setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent/10 transition-colors min-h-[38px]"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-3 w-3 text-muted-foreground" />
                    <span>Practice Settings & Profile</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard/billing"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (isMobile) setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent/10 transition-colors min-h-[38px]"
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    <span>7-Day Trial & Plan</span>
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">Active</span>
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/10 transition-colors min-h-[38px]"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Test Bot Trigger Banner */}
        <div className="p-3 pb-1">
          <button
            onClick={() => {
              setIsTestDrawerOpen(true);
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-accent p-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all flex items-center justify-between cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-cyan-200" />
              <span>Test Bot Live</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-medium">
              Simulator
            </span>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4 text-xs font-medium">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                const itemLabel = uiMode === "pro" && item.proLabel ? item.proLabel : item.label;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setIsMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group min-h-[44px]",
                      isActive
                        ? "bg-foreground text-background font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                      item.highlight && !isActive && "text-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={cn("h-4 w-4 shrink-0", item.highlight && !isActive && "text-accent")} />
                      <span className="truncate">{itemLabel}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wide",
                          isActive
                            ? "bg-background/20 text-background"
                            : item.highlight
                            ? "bg-accent/20 text-accent font-bold"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Quota & Mode Switcher at Sidebar Footer */}
      <div className="p-3 border-t border-border/40 space-y-2.5">
        <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3 text-accent" />
              <span>UI Mode:</span>
              <strong className={uiMode === "simple" ? "text-emerald-400" : "text-accent"}>
                {uiMode === "simple" ? "Simple" : "Pro"}
              </strong>
            </span>
            <button
              onClick={toggleUiMode}
              className="text-[10px] font-bold text-accent hover:underline cursor-pointer"
            >
              {uiMode === "simple" ? (
                <>
                  <span className="text-muted-foreground">Switch to</span> Pro
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Switch to</span> Simple
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {uiMode === "simple"
              ? "Clean & friendly interface for business owners."
              : "Full controls, API endpoints & prompt tuning."}
          </p>
        </div>

        {/* Quota Bar */}
        <div className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
            <span>Monthly AI Chats</span>
            <span className="text-emerald-500 font-mono">142 / 2,000</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: "7.1%" }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Direct FAQs: <strong className="text-foreground">892 (Free)</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Chatify v1.0 • Prod</span>
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI Ready
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Visible on md: 768px and above) */}
      <aside className="hidden md:flex w-64 border-r border-border/60 bg-card/60 flex-col justify-between h-screen sticky top-0 overflow-y-auto z-20">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer (Below 768px) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] border-r border-border/70 bg-card h-full flex flex-col justify-between overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {/* Mobile Drawer Close Button */}
            <div className="absolute top-3.5 right-3.5 z-30">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
