"use client";

import { useWorkspace } from "./workspace-provider";
import { formatCurrency } from "@/lib/utils";
import { Clock, DollarSign, MessageCircle, UserCheck } from "lucide-react";

export function RoiWidget() {
  const { activeWorkspace } = useWorkspace();

  // Simulated metrics for active workspace
  const totalChats = 1034;
  const totalLeads = 38;
  const hoursSaved = Math.round((totalChats * 3) / 60); // 3 min per chat saved
  const estimatedPipelineValue = totalLeads * (activeWorkspace.avg_job_value || 300);
  const planCost = 29; // Starter Plan
  const netRoiMultiple = Math.round(estimatedPipelineValue / planCost);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Inquiries Handled */}
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Inquiries Answered</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
            <MessageCircle className="h-4 w-4 text-accent" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {totalChats.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <span>892 answered via Instant FAQ ($0 cost)</span>
        </div>
      </div>

      {/* 2. Leads Captured */}
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Leads Captured</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {totalLeads}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          14 Hot • 18 Warm • 6 New
        </div>
      </div>

      {/* 3. Hours Saved */}
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Staff Hours Saved</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {hoursSaved} hrs
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Based on 3 min / inquiry
        </div>
      </div>

      {/* 4. Estimated Pipeline Value */}
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Est. Pipeline Value</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-emerald-400">
          {formatCurrency(estimatedPipelineValue, activeWorkspace.currency)}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {netRoiMultiple}x return on $29/mo plan
        </div>
      </div>
    </div>
  );
}
