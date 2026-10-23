"use client";

import { useState } from "react";
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
  const [leads, setLeads] = useState<LeadItem[]>([
    {
      id: "lead-1",
      name: "Michael Torres",
      email: "mtorres@gmail.com",
      phone: "+1 (555) 392-1084",
      requirements: "Needs emergency root canal treatment tomorrow morning. Severe toothache.",
      score: "hot",
      status: "new",
      capturedAt: "Today at 2:41 PM",
      source: "WhatsApp Assistant",
    },
    {
      id: "lead-2",
      name: "David Vance",
      email: "david.vance@techcorp.io",
      phone: "+1 (555) 781-9923",
      requirements: "Crown replacement and teeth whitening package for upcoming wedding.",
      score: "hot",
      status: "contacted",
      capturedAt: "Today at 1:15 PM",
      source: "Instagram DM",
    },
    {
      id: "lead-3",
      name: "Sarah Jenkins",
      email: "sarah.j@gmail.com",
      phone: "+1 (555) 234-8891",
      requirements: "Inquiring about Delta Dental PPO coverage for routine adult cleanings.",
      score: "warm",
      status: "qualified",
      capturedAt: "Yesterday at 4:30 PM",
      source: "Website Widget",
    },
    {
      id: "lead-4",
      name: "Robert Miller",
      email: "rmiller@outlook.com",
      phone: "+1 (555) 441-2093",
      requirements: "Needs general dental checkup for two children under 10.",
      score: "warm",
      status: "won",
      capturedAt: "Oct 21, 2026",
      source: "Website Widget",
    },
    {
      id: "lead-5",
      name: "Emily Clark",
      email: "emily.c@yahoo.com",
      phone: "+1 (555) 882-9011",
      requirements: "Asked about teeth whitening pricing ranges.",
      score: "cold",
      status: "contacted",
      capturedAt: "Oct 20, 2026",
      source: "Website Widget",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    const headers = "Name,Email,Phone,Score,Status,CapturedAt,Requirements,Source\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.name}","${l.email}","${l.phone}","${l.score}","${l.status}","${l.capturedAt}","${l.requirements.replace(/"/g, '""')}","${l.source}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chatify_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const updateLeadStatus = (id: string, newStatus: LeadItem["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Leads & Pipeline CRM
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Every customer who left contact details across your website, WhatsApp, and social media.
          </p>
        </div>

        <Button size="sm" onClick={handleExportCsv} className="h-8 text-xs gap-1.5 shadow-sm">
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, or email..."
            className="h-9 pl-9 text-xs"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto text-xs">
          {["all", "new", "contacted", "qualified", "won"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md capitalize font-medium transition-colors ${
                statusFilter === st
                  ? "bg-foreground text-background font-bold shadow-sm"
                  : "border border-border/60 bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <Card className="border-border/70 shadow-sm overflow-hidden">
        <div className="divide-y divide-border/30 text-xs">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-foreground text-sm">{lead.name}</span>
                  {lead.score === "hot" && (
                    <Badge variant="destructive" className="text-[10px] py-0 px-2 flex items-center gap-1 font-bold">
                      <Flame className="h-3 w-3 fill-white" /> Hot Lead
                    </Badge>
                  )}
                  {lead.score === "warm" && (
                    <Badge variant="warning" className="text-[10px] py-0 px-2">
                      Warm
                    </Badge>
                  )}
                  {lead.score === "cold" && (
                    <Badge variant="outline" className="text-[10px] py-0 px-2 text-muted-foreground">
                      Cold
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground font-mono">
                    via {lead.source}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-foreground hover:underline font-mono">
                    <Phone className="h-3.5 w-3.5 text-accent" /> {lead.phone}
                  </a>
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:underline">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {lead.email}
                  </a>
                  <span className="text-[11px] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {lead.capturedAt}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md border border-border/40 mt-1">
                  &ldquo;{lead.requirements}&rdquo;
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={lead.status}
                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring capitalize"
                >
                  <option value="new">Status: New</option>
                  <option value="contacted">Status: Contacted</option>
                  <option value="qualified">Status: Qualified</option>
                  <option value="won">Status: Won / Booked</option>
                  <option value="lost">Status: Lost</option>
                </select>
                <a href={`tel:${lead.phone}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                    <Phone className="h-3 w-3 text-emerald-400" />
                    <span>Call Now</span>
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
