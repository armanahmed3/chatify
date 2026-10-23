"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { formatCurrency } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  CheckCircle,
  HelpCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ThumbsDown,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function AnalyticsAndRoiPage() {
  const { activeWorkspace } = useWorkspace();

  // Unanswered Questions list with 1-click "Add as Q&A"
  const [unanswered, setUnanswered] = useState([
    {
      id: "un-1",
      question: "Do you offer sedation dentistry or laughing gas for nervous patients?",
      count: 14,
      lastAsked: "Today at 1:40 PM",
    },
    {
      id: "un-2",
      question: "Is there free customer parking behind the clinic building?",
      count: 9,
      lastAsked: "Yesterday",
    },
    {
      id: "un-3",
      question: "What is your cancellation policy if I get sick?",
      count: 7,
      lastAsked: "Oct 21, 2026",
    },
  ]);

  // Modal / Inline Answer Training
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [trainedSuccess, setTrainedSuccess] = useState<string | null>(null);

  // Thumbs down reviews list
  const [downvotes, setDownvotes] = useState([
    {
      id: "dv-1",
      query: "How much does Invisalign cost without insurance?",
      botAnswer: "Our dental cleanings start at $95. For specific orthodontic pricing please call our team.",
      reason: "Bot didn't give direct Invisalign pricing estimate.",
      time: "2 days ago",
    },
  ]);

  const handleAddQa = async (id: string, question: string) => {
    if (!answerDraft.trim()) return;

    try {
      await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "qa",
          title: `FAQ: ${question.substring(0, 30)}...`,
          qa_pairs: [{ question, answer: answerDraft }],
        }),
      });

      setUnanswered((prev) => prev.filter((item) => item.id !== id));
      setTrainedSuccess(`Added "${question}" to instant Q&A answers!`);
      setTrainingId(null);
      setAnswerDraft("");
      setTimeout(() => setTrainedSuccess(null), 3000);
    } catch {}
  };

  const handleIgnore = (id: string) => {
    setUnanswered((prev) => prev.filter((item) => item.id !== id));
  };

  // Metrics
  const totalInquiries = 1034;
  const resolutionRate = 89;
  const avgConfidence = 94;
  const totalLeads = 38;
  const hoursSaved = Math.round((totalInquiries * 3) / 60);
  const estimatedPipeline = totalLeads * (activeWorkspace.avg_job_value || 300);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Analytics & Return on Investment (ROI)
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          See exactly how much time and revenue Chatify generates for your business every week.
        </p>
      </div>

      {trainedSuccess && (
        <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{trainedSuccess}</span>
        </div>
      )}

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Total Inquiries Handled</span>
            <BarChart3 className="h-4 w-4 text-accent" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">
            {totalInquiries.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">
            +18% from last week
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Resolution Rate</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">{resolutionRate}%</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Inquiries resolved without human escalation
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Staff Hours Saved</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">{hoursSaved} hrs</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Equivalent to ~1.3 full-time weeks saved
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Pipeline Value Generated</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-400">
            {formatCurrency(estimatedPipeline, activeWorkspace.currency)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            From {totalLeads} captured patient leads
          </div>
        </div>
      </div>

      {/* Hourly Heatmap & Top Inquiries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/70 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Busiest Customer Inquiry Hours</h3>
            <Badge variant="outline" className="text-[10px]">Peak: 6:00 PM – 9:00 PM</Badge>
          </div>
          <div className="space-y-2 pt-2">
            {[
              { label: "8am - 12pm (Morning)", pct: 35 },
              { label: "12pm - 5pm (Afternoon)", pct: 28 },
              { label: "5pm - 10pm (After-Hours Peak)", pct: 58 },
              { label: "10pm - 8am (Overnight)", pct: 19 },
            ].map((slot, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{slot.label}</span>
                  <span className="font-semibold text-foreground">{slot.pct}% of chats</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${slot.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            💡 Over <strong>77%</strong> of your customer inquiries arrive when your physical reception desk is closed. Chatify captures them automatically.
          </p>
        </Card>

        {/* Unanswered Questions (1-Click Training) */}
        <Card className="border-border/70 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-accent" />
                <span>Unanswered Questions</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Questions customers asked where confidence was low. Click to train an instant answer.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {unanswered.length} Questions
            </Badge>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            {unanswered.map((item) => (
              <div key={item.id} className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">&ldquo;{item.question}&rdquo;</span>
                    <div className="text-[10px] text-muted-foreground flex gap-2 mt-0.5">
                      <span>Asked {item.count} times</span>
                      <span>•</span>
                      <span>{item.lastAsked}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTrainingId(trainingId === item.id ? null : item.id)}
                      className="h-7 text-xs gap-1 font-semibold"
                    >
                      <Plus className="h-3 w-3" /> Add Answer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleIgnore(item.id)}
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Ignore
                    </Button>
                  </div>
                </div>

                {/* Inline Trainer Drawer */}
                {trainingId === item.id && (
                  <div className="p-3 rounded-lg border border-border/60 bg-secondary/30 space-y-2 mt-2">
                    <label className="text-[11px] font-semibold text-foreground">
                      Enter Verified Answer for &ldquo;{item.question}&rdquo;:
                    </label>
                    <Textarea
                      rows={2}
                      value={answerDraft}
                      onChange={(e) => setAnswerDraft(e.target.value)}
                      placeholder="e.g. Yes! We offer nitrous oxide (laughing gas) and gentle conscious sedation for nervous patients."
                      className="text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTrainingId(null)}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddQa(item.id, item.question)}
                        className="h-7 text-xs font-semibold gap-1"
                      >
                        <Check className="h-3 w-3" /> Save to Knowledge
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Thumbs-Down Customer Feedback Review List */}
      <Card className="border-border/70 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <ThumbsDown className="h-4 w-4 text-destructive" />
            <span>Customer Feedback & Thumbs-Down Audits</span>
          </h3>
          <Badge variant="outline" className="text-[10px]">1 Flagged Interaction</Badge>
        </div>

        <div className="divide-y divide-border/30 text-xs">
          {downvotes.map((item) => (
            <div key={item.id} className="py-3 space-y-1">
              <div className="font-semibold text-foreground">Question: &ldquo;{item.query}&rdquo;</div>
              <div className="text-muted-foreground text-[11px] bg-secondary/30 p-2 rounded border border-border/40">
                Bot Reply: {item.botAnswer}
              </div>
              <div className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" /> Reason: {item.reason} ({item.time})
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
