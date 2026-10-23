"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Chatbots", href: "/dashboard/chatbots", icon: Bot },
    { label: "Training Sources", href: "/dashboard/training", icon: BrainCircuit },
    { label: "Unified Inbox", href: "/dashboard/inbox", icon: Inbox },
    { label: "Leads & CRM", href: "/dashboard/leads", icon: UserCheck },
    { label: "Analytics & ROI", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Channels (Meta)", href: "/dashboard/channels", icon: Share2 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Billing & Plan", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <aside className="w-64 border-r border-border/60 bg-card/60 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Workspace Brand Switcher */}
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/80 p-2.5 shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white font-bold text-xs"
                style={{ backgroundColor: activeWorkspace.accent_color || "#18181b" }}
              >
                {activeWorkspace.name.charAt(0)}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-foreground truncate">
                  {activeWorkspace.name}
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  Starter Plan • Active
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/40 space-y-3">
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
            <span>AI Chats This Month</span>
            <span className="text-emerald-400">142 / 2,000</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "7.1%" }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>FAQ Answers: <strong className="text-foreground">892 (Unlimited)</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Chatify v1.0-PROD</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI Router Healthy
          </span>
        </div>
      </div>
    </aside>
  );
}
