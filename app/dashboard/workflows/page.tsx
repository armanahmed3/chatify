"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Workflow,
  Plus,
  Trash2,
  Download,
  Upload,
  Split,
  Zap,
  Check,
  Tag,
  ArrowRight,
} from "lucide-react";

interface WorkflowRuleItem {
  id: string;
  name: string;
  triggerType: "keyword" | "intent" | "first_message" | "after_hours";
  triggerCondition: string;
  actionType: "lead_form" | "coupon" | "human_handover" | "fixed_answer";
  actionPayload: string;
  isEnabled: boolean;
}

export default function WorkflowsPage() {
  const [rules, setRules] = useState<WorkflowRuleItem[]>([
    {
      id: "rule-1",
      name: "Emergency Toothache Handover",
      triggerType: "keyword",
      triggerCondition: "toothache, emergency, severe pain",
      actionType: "lead_form",
      actionPayload: "Prompt emergency patient phone number immediately",
      isEnabled: true,
    },
    {
      id: "rule-2",
      name: "First-Time Visitor Welcome Coupon",
      triggerType: "first_message",
      triggerCondition: "New session started",
      actionType: "coupon",
      actionPayload: "15% off first teeth cleaning special",
      isEnabled: true,
    },
    {
      id: "rule-3",
      name: "Angry Customer Human Escalation",
      triggerType: "intent",
      triggerCondition: "Intent = Complaint / Angry",
      actionType: "human_handover",
      actionPayload: "Silence bot and alert practice manager",
      isEnabled: true,
    },
  ]);

  // A/B Test state
  const [abTestActive, setAbTestActive] = useState(true);
  const [variantA, setVariantA] = useState("Hi there! 👋 How can we help you today with your smile?");
  const [variantB, setVariantB] = useState("Looking for an appointment or insurance question? We're here to help!");

  // Export / Import
  const [importJson, setImportJson] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleExportBotJson = () => {
    const exportData = {
      botName: "Apex Dental Assistant",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      personality: "helpful, professional, and empathetic",
      instructions: "Help patients book appointments and answer insurance FAQs.",
      rules,
      abTest: { variantA, variantB, active: abTestActive },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chatify_bot_export_${Date.now()}.json`;
    link.click();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (parsed.rules) setRules(parsed.rules);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 2500);
      setImportJson("");
    } catch {
      alert("Invalid JSON package format.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Workflow Automations & A/B Testing
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Execute fast deterministic rules before the AI router, split test greetings, and export bots as JSON.
        </p>
      </div>

      {/* Rules Table */}
      <Card className="border-border/70 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Workflow className="h-4 w-4 text-accent" />
              <span>IF-THEN Automation Rules</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              These rules run in under 5ms before any LLM inference, saving tokens and triggering instant workflows.
            </p>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5 shadow-sm">
            <Plus className="h-3 w-3" /> Add Rule
          </Button>
        </div>

        <div className="divide-y divide-border/40 text-xs">
          {rules.map((rule) => (
            <div key={rule.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <span>{rule.name}</span>
                  <Badge variant={rule.isEnabled ? "success" : "secondary"} className="text-[10px] py-0 px-1.5">
                    {rule.isEnabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-[11px] flex flex-wrap items-center gap-2">
                  <span>IF: <strong className="text-foreground">{rule.triggerType}</strong> ({rule.triggerCondition})</span>
                  <span>➔</span>
                  <span>THEN: <strong className="text-accent">{rule.actionType}</strong> ({rule.actionPayload})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleRule(rule.id)}
                  className="h-7 text-xs text-muted-foreground"
                >
                  {rule.isEnabled ? "Disable" : "Enable"}
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* A/B Testing Section */}
      <Card className="border-border/70 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Split className="h-4 w-4 text-accent" />
              <span>Greeting A/B Testing (Conversion Optimization)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Automatically splits 50% of visitors to Variant A and 50% to Variant B to measure which welcome message captures more appointments.
            </p>
          </div>
          <Badge variant="success" className="text-[10px]">Test Running</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Variant A (Original)</span>
              <span className="text-emerald-400 font-mono">14.2% Lead Rate</span>
            </div>
            <Input
              value={variantA}
              onChange={(e) => setVariantA(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Variant B (Challenger)</span>
              <span className="text-emerald-400 font-mono">18.6% Lead Rate (Winner)</span>
            </div>
            <Input
              value={variantB}
              onChange={(e) => setVariantB(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>
      </Card>

      {/* Export / Import Bot JSON Packages */}
      <Card className="border-border/70 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Portable Bot Export & Import</h3>
          <p className="text-xs text-muted-foreground">
            Backup your bot configuration or duplicate it across sub-accounts as a reusable JSON package.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleExportBotJson} className="h-9 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export Bot Package (JSON)</span>
          </Button>
          <div className="flex-1 flex gap-2">
            <Input
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste JSON package code to import..."
              className="h-9 text-xs font-mono"
            />
            <Button size="sm" onClick={handleImportJson} className="h-9 text-xs gap-1.5 shrink-0">
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </Button>
          </div>
        </div>
        {importSuccess && (
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <Check className="h-3.5 w-3.5" /> Bot package imported successfully!
          </div>
        )}
      </Card>
    </div>
  );
}
