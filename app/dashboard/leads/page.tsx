"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Download,
  Search,
  Phone,
  Mail,
  Flame,
  Clock,
  CheckCircle,
  Filter,
  User,
  Building,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  PhoneCall,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  requirements: string;
  score: "hot" | "warm" | "cold";
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  capturedAt: string;
  source: string;
}

export default function LeadsPage() {
  const { activeWorkspace } = useWorkspace();
  const isDemo = activeWorkspace.id === "ws-demo-001";

  const [leads, setLeads] = useState<LeadItem[]>(() => {
    if (isDemo) {
      return [
        {
          id: "lead-1",
          name: "Michael Torres",
          email: "mtorres@gmail.com",
          phone: "+1 (555) 392-1084",
          requirements: "Needs emergency consultation tomorrow morning.",
          score: "hot",
          status: "new",
          capturedAt: "Today at 2:41 PM",
          source: "Website Widget",
        },
        {
          id: "lead-2",
          name: "David Vance",
          email: "Not Given",
          phone: "+1 (555) 781-9923",
          requirements: "Asked: 'can you text me pricing quote?'",
          score: "hot",
          status: "contacted",
          capturedAt: "Today at 1:15 PM",
          source: "WhatsApp Assistant",
        },
      ];
    }
    try {
      const saved = localStorage.getItem(`chatify_leads_${activeWorkspace.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.requirements.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesScore = scoreFilter === "all" || lead.score === scoreFilter;
    return matchesSearch && matchesStatus && matchesScore;
  });

  const handleExportCsv = () => {
    const headers = "Name,Phone,Email,Score,Status,CapturedAt,Requirements,Source\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.name}","${l.phone}","${l.email}","${l.score}","${l.status}","${l.capturedAt}","${l.requirements.replace(/"/g, '""')}","${l.source}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chatify_customer_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const updateLeadStatus = (id: string, newStatus: LeadItem["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Customer Leads & Pipeline CRM
            </h2>
            <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent text-[11px] font-bold">
              Auto-Sync 24/7
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time contact details extracted from chat conversations. Unprovided fields are cleanly marked as <span className="font-semibold text-foreground italic">Not Given</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="h-8 text-xs gap-1.5 shadow-sm">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Refresh</span>
          </Button>
          <Button size="sm" onClick={handleExportCsv} className="h-8 text-xs gap-1.5 shadow-sm">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Total Leads Captured</div>
          <div className="text-2xl font-black text-foreground mt-1">{leads.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">100% Zero-Loss Capture</div>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>Hot Inquiries</span>
          </div>
          <div className="text-2xl font-black text-rose-500 mt-1">
            {leads.filter((l) => l.score === "hot").length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Ready to schedule / book</div>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-accent" />
            <span>Phone Numbers Verified</span>
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {leads.filter((l) => l.phone !== "Not Given").length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Direct SMS / Call ready</div>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>Emails On File</span>
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {leads.filter((l) => l.email !== "Not Given").length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Email marketing ready</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by customer name, phone, email, notes..."
            className="h-11 sm:h-9 pl-9 text-base sm:text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
            {["all", "new", "contacted", "qualified", "won"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize text-xs font-medium transition-colors cursor-pointer min-h-[44px] flex items-center justify-center ${
                  statusFilter === st
                    ? "bg-foreground text-background font-bold shadow-sm"
                    : "border border-border/60 bg-card text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="min-h-[44px] sm:min-h-0 h-11 sm:h-8 rounded-lg border border-border/70 bg-background px-3 text-base sm:text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Scores</option>
            <option value="hot">🔥 Hot Leads</option>
            <option value="warm">⚡ Warm Leads</option>
            <option value="cold">❄️ Cold Leads</option>
          </select>
        </div>
      </div>

      {/* Professional Customer Leads Table */}
      <Card className="border border-border/70 shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-border/80 bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Inquiry / Requirements</th>
                <th className="py-3 px-4">Source & Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="font-semibold text-sm">No customer leads found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const hasPhone = lead.phone && lead.phone !== "Not Given";
                  const hasEmail = lead.email && lead.email !== "Not Given";

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-secondary/25 transition-colors group"
                    >
                      {/* Customer Column */}
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-xs">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {lead.score === "hot" && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.2 text-[9px] font-extrabold text-rose-500">
                                  <Flame className="h-2.5 w-2.5 fill-rose-500" /> Hot
                                </span>
                              )}
                              {lead.score === "warm" && (
                                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-500">
                                  Warm
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {lead.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasPhone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground font-semibold hover:text-accent hover:underline"
                          >
                            <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground italic border border-border/40">
                            Not Given
                          </span>
                        )}
                      </td>

                      {/* Email Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasEmail ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
                          >
                            <Mail className="h-3 w-3 text-indigo-400 shrink-0" />
                            <span>{lead.email}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground italic border border-border/40">
                            Not Given
                          </span>
                        )}
                      </td>

                      {/* Inquiry / Requirements Column */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div
                          className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-secondary/30 px-2 py-1 rounded border border-border/30"
                          title={lead.requirements}
                        >
                          &ldquo;{lead.requirements}&rdquo;
                        </div>
                      </td>

                      {/* Source & Date Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-foreground">
                          {lead.source}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{lead.capturedAt}</span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                          className="h-7 rounded-md border border-border/80 bg-background px-2 text-[11px] font-medium text-foreground focus:outline-none capitalize"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="won">Won / Booked</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>

                      {/* Action Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {hasPhone ? (
                          <a href={`tel:${lead.phone}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30">
                              <PhoneCall className="h-3 w-3 text-emerald-400" />
                              <span>Call</span>
                            </Button>
                          </a>
                        ) : hasEmail ? (
                          <a href={`mailto:${lead.email}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 hover:bg-indigo-500/10 hover:text-indigo-400">
                              <Mail className="h-3 w-3 text-indigo-400" />
                              <span>Email</span>
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" variant="ghost" disabled className="h-7 text-[11px] opacity-40">
                            No Contact
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
