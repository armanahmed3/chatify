"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "./workspace-provider";
import {
  Home,
  Bot,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  ChevronDown,
  Check,
  Plus,
  LogOut,
  X,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "My Chatbot", href: "/dashboard/chatbots", icon: Bot },
  { label: "Knowledge", href: "/dashboard/training", icon: BookOpen },
  { label: "Conversations", href: "/dashboard/inbox", icon: MessageSquare },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const {
    activeWorkspace,
    workspaces,
    setActiveWorkspace,
    createWorkspace,
    logout,
    setIsTestDrawerOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const closeMobile = () => setIsMobileSidebarOpen(false);

  const content = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Business switcher */}
        <div className="relative border-b border-border/40 p-4" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background p-2.5 text-left hover:bg-secondary/50"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
                style={{ backgroundColor: activeWorkspace.accent_color || "#2563eb" }}
              >
                {activeWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-sm font-semibold">{activeWorkspace.name}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", menuOpen && "rotate-180")} />
          </button>

          {menuOpen && (
            <div className="absolute left-4 right-4 top-full z-50 mt-2 space-y-2 rounded-lg border border-border bg-popover p-2 shadow-lg">
              <p className="px-2 pt-1 text-xs text-muted-foreground">Your businesses</p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setMenuOpen(false);
                    closeMobile();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-secondary"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === activeWorkspace.id && <Check className="h-4 w-4 text-accent" />}
                </button>
              ))}

              {adding ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newName.trim()) return;
                    createWorkspace(newName.trim());
                    setNewName("");
                    setAdding(false);
                  }}
                  className="space-y-2 px-1"
                >
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Business name"
                    autoFocus
                    required
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="h-8 flex-1 rounded-md bg-accent text-sm font-medium text-accent-foreground">
                      Add
                    </button>
                    <button type="button" onClick={() => setAdding(false)} className="h-8 px-3 text-sm text-muted-foreground">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-accent hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" /> Add another business
                </button>
              )}

              <div className="border-t border-border pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                className={cn(
                  "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                  active
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border/40 p-3">
        <button
          type="button"
          onClick={() => {
            setIsTestDrawerOpen(true);
            closeMobile();
          }}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          <Play className="h-4 w-4" /> Test your chatbot
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 z-20 hidden h-screen w-60 flex-col overflow-y-auto border-r border-border/60 bg-card/60 md:flex">
        {content}
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-0" onClick={closeMobile} aria-hidden="true" />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-card shadow-xl">
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
