"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ShieldAlert,
  Server,
  Building2,
  Users,
  DollarSign,
  Activity,
  Bot,
  Search,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react";

export default function SuperAdminPage() {
  const [workspaces, setWorkspaces] = useState([
    { id: "ws-demo-001", name: "Apex Dental Clinic", plan: "starter", is_suspended: false, bots: 1, leads: 38 },
    { id: "ws-demo-002", name: "Downtown Auto Repairs", plan: "starter", is_suspended: false, bots: 1, leads: 24 },
    { id: "ws-demo-003", name: "Luxe Beauty & Spa", plan: "pro", is_suspended: false, bots: 3, leads: 62 },
    { id: "ws-demo-004", name: "Summit Law Firm", plan: "pro", is_suspended: false, bots: 2, leads: 19 },
    { id: "ws-demo-005", name: "Velocity Fitness Studio", plan: "agency", is_suspended: false, bots: 6, leads: 140 },
  ]);

  const [providerHealth, setProviderHealth] = useState([
    { name: "Google Gemini Flash", tier: "Free Tier 1", status: "operational", latency: "380ms" },
    { name: "Groq LLaMA 3.1 8B", tier: "Free Tier 2", status: "operational", latency: "140ms" },
    { name: "Groq LLaMA 3.3 70B", tier: "Free Tier 3", status: "operational", latency: "260ms" },
    { name: "Cloudflare Workers AI", tier: "Free Tier 4", status: "operational", latency: "410ms" },
    { name: "OpenRouter Free Models", tier: "Free Tier 5", status: "operational", latency: "490ms" },
  ]);

  const handleToggleSuspend = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === id ? { ...ws, is_suspended: !ws.is_suspended } : ws
      )
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/60 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Super Admin Control Center
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Platform governance, multi-tenant workspace management, and AI provider health.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <span>Back to Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Tenant Workspaces</span>
            <Building2 className="h-4 w-4 text-accent" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">24</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">All tenants isolated with RLS</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex justify-between text-xs text-muted-foreground font-semibold">
            <span>Active AI Chatbots</span>
            <Bot className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">42</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Web widgets + WhatsApp</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Patient & Client Leads</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">318</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">+44 new today</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex justify-between text-xs text-muted-foreground font-semibold">
            <span>Estimated Platform MRR</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-400">$1,890</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Flat subscriptions</div>
        </div>
      </div>

      {/* AI Provider Health Dashboard */}
      <Card className="border-border/70 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-accent" />
            <span>AI Router Provider Status (Live Latency & Failover)</span>
          </h3>
          <Badge variant="success" className="text-[10px]">All Providers Operational</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {providerHealth.map((provider, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground truncate">{provider.name}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-muted-foreground">{provider.tier}</div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold pt-1">
                Latency: {provider.latency}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Workspaces Management Table */}
      <Card className="border-border/70 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground">Tenant Workspaces & Suspension Control</h3>
          <span className="text-xs text-muted-foreground">Suspension immediately deactivates public bot widgets</span>
        </div>

        <div className="divide-y divide-border/30 text-xs">
          {workspaces.map((ws) => (
            <div key={ws.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{ws.name}</span>
                  <Badge variant={ws.is_suspended ? "destructive" : "outline"} className="text-[10px]">
                    {ws.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {ws.plan} Plan
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground flex gap-3">
                  <span>ID: {ws.id}</span>
                  <span>•</span>
                  <span>{ws.bots} Bots</span>
                  <span>•</span>
                  <span>{ws.leads} Leads Captured</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={ws.is_suspended ? "default" : "destructive"}
                  onClick={() => handleToggleSuspend(ws.id)}
                  className="h-8 text-xs gap-1.5"
                >
                  {ws.is_suspended ? (
                    <>
                      <Unlock className="h-3.5 w-3.5" /> Re-activate Workspace
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" /> Suspend
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
