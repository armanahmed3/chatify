"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { INDUSTRY_TEMPLATES, IndustryTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Bot,
  Copy,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  Settings,
  Palette,
  Globe,
  Sliders,
  Check,
  Send,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  Code,
} from "lucide-react";

function ChatbotBuilderContent() {
  const searchParams = useSearchParams();
  const { activeWorkspace, uiMode, toggleUiMode } = useWorkspace();
  const isDemo = activeWorkspace.id === "ws-demo-001";
  const [activeTab, setActiveTab] = useState<"general" | "personality" | "appearance" | "language" | "embed">("general");

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-dental");
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const defaultBotName = isDemo ? "Apex Dental Assistant" : `${activeWorkspace.name} Assistant`;
  const defaultInstructions = isDemo
    ? "You are the virtual receptionist for Apex Dental Clinic. Welcome visitors warmly, answer questions accurately regarding services, dental insurance (Delta Dental, MetLife), hours, and emergency care. Offer appointment booking slots whenever appropriate. Never invent clinical diagnoses or arbitrary prices."
    : `You are the virtual receptionist for ${activeWorkspace.name}. Welcome visitors warmly, answer questions accurately regarding services, pricing, hours, and booking. Offer appointment booking slots whenever appropriate. Never invent arbitrary prices.`;
  const defaultWelcome = isDemo
    ? "Hello! Welcome to Apex Dental Clinic. How can I assist you with your smile today?"
    : `Hello! Welcome to ${activeWorkspace.name}. How can I assist you today?`;

  // Bot state
  const [botName, setBotName] = useState(defaultBotName);
  const [description, setDescription] = useState(`Main customer service & appointment booking bot for ${activeWorkspace.name}`);
  const [isActive, setIsActive] = useState(true);
  const [personality, setPersonality] = useState("helpful, professional, and empathetic");
  const [tone, setTone] = useState("friendly");
  const [temperature, setTemperature] = useState(0.3);
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [fallbackMessage, setFallbackMessage] = useState(
    "I don't have the exact details on that right now. Please leave your phone number and our team will get back to you right away!"
  );
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [welcomeMessage, setWelcomeMessage] = useState(defaultWelcome);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What are your business hours?",
    "How much do your services cost?",
    "Can I book an appointment?",
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [saved, setSaved] = useState(false);

  const botSlug = botName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "demo-apex";
  const embedSnippet = `<script src="https://chatify.ai/widget.js" data-bot-id="${botSlug}" data-color="${primaryColor}" data-text-color="#ffffff" data-brand="${botName}" defer></script>`;

  // Live simulation chat inside builder
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState([
    { sender: "bot", text: welcomeMessage },
  ]);

  const applyTemplate = (tpl: IndustryTemplate, showNotice = true) => {
    setSelectedTemplateId(tpl.id);
    setBotName(tpl.name);
    setDescription(tpl.description);
    setPersonality(tpl.personality);
    setTone(tpl.tone);
    setInstructions(tpl.instructions);
    const welcome = `Hello! Welcome to ${tpl.name}. How can I assist you today?`;
    setWelcomeMessage(welcome);
    setSuggestedQuestions(tpl.suggestedQuestions);
    setTestMessages([{ sender: "bot", text: welcome }]);
    if (showNotice) {
      setTemplateNotice(`✨ Active Template: "${tpl.name}" applied successfully!`);
      setTimeout(() => setTemplateNotice(null), 6000);
    }
    try {
      localStorage.setItem("chatify_active_template_id", tpl.id);
      localStorage.setItem("chatify_active_template", JSON.stringify(tpl));
    } catch {}
  };

  useEffect(() => {
    const templateParam = searchParams.get("template");
    let targetTemplate: IndustryTemplate | undefined;

    if (templateParam) {
      targetTemplate = Object.values(INDUSTRY_TEMPLATES).find(
        (t) => t.id === templateParam || t.industry === templateParam
      );
    } else {
      try {
        const savedId = localStorage.getItem("chatify_active_template_id");
        if (savedId) {
          targetTemplate = Object.values(INDUSTRY_TEMPLATES).find((t) => t.id === savedId);
        }
      } catch {}
    }

    if (targetTemplate) {
      applyTemplate(targetTemplate, !!templateParam);
    }
  }, [searchParams]);

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput;
    setTestInput("");
    setTestMessages((prev) => [...prev, { sender: "user", text: userText }]);

    setTimeout(() => {
      let reply = "";
      const currentTpl =
        Object.values(INDUSTRY_TEMPLATES).find((t) => t.id === selectedTemplateId) ||
        INDUSTRY_TEMPLATES.dental;

      const lower = userText.toLowerCase();

      // 1. Direct answer for pricing queries (English, Urdu, Hindi, Roman Urdu)
      const isPriceQuery =
        lower.includes("price") ||
        lower.includes("cost") ||
        lower.includes("rate") ||
        lower.includes("kitni") ||
        lower.includes("kitna") ||
        lower.includes("kya hai") ||
        lower.includes("charges") ||
        lower.includes("fee") ||
        lower.includes("how much") ||
        lower.includes("cleaning");

      if (isPriceQuery) {
        if (currentTpl.id === "tpl-restaurant") {
          reply = "Our dinner entrees range between $22 and $48. Appetizers and artisan pastas are $14-$24, and our 3-course tasting menu is $75 per guest. Would you like to check our table availability?";
        } else if (currentTpl.id === "tpl-garage") {
          reply = "Full synthetic oil change is $65. Front brake pad replacement with rotor resurfacing starts at $185 per axle. Check-engine light diagnostic scan is 100% free!";
        } else if (currentTpl.id === "tpl-salon") {
          reply = "Full balayage, toner and blowout starts at $185. Standard designer haircut & style is $65, and keratin treatment is $150.";
        } else if (currentTpl.id === "tpl-gym") {
          reply = "Our 24/7 all-access gym membership is $49/month with no annual lock-in contract. 1-on-1 personal training sessions start at $45/hour.";
        } else if (currentTpl.id === "tpl-law") {
          reply = "We offer a complimentary 20-minute preliminary case evaluation. Retainer rates depend on whether your case is personal injury, estate, or business litigation.";
        } else if (currentTpl.id === "tpl-ecommerce") {
          reply = "Standard delivery is flat $4.99 and free on orders over $50! All products come with a 30-day money-back guarantee.";
        } else if (currentTpl.id === "tpl-realestate") {
          reply = "Buyer consultations and property showings are 100% free for buyers. For home sellers, our full-service brokerage listing commission is 2.5%.";
        } else {
          // Dental Clinic
          reply = "Our comprehensive new patient special is $95 (includes complete dental exam, digital x-rays, and standard teeth cleaning). Routine adult cleanings are $95 to $120. We also accept Delta Dental, MetLife, Cigna, and all major PPO insurance plans!";
        }
      } else {
        // 2. Check matched pre-loaded FAQs
        const matchedQa = currentTpl.qaPairs.find((qa) => {
          const qWords = qa.question.toLowerCase().split(" ");
          return qWords.some((w) => w.length > 3 && lower.includes(w));
        });

        if (matchedQa) {
          reply = matchedQa.answer;
        } else if (lower.includes("book") || lower.includes("appointment") || lower.includes("reserve") || lower.includes("booking")) {
          reply = `I would be happy to schedule an appointment for you at ${botName}! We have openings tomorrow morning or Thursday afternoon. What time works best for you?`;
        } else if (lower.includes("hour") || lower.includes("open") || lower.includes("time") || lower.includes("timing")) {
          reply = `We are open Monday through Friday from 8:00 AM to 6:00 PM, and Saturday 9:00 AM to 2:00 PM!`;
        } else if (lower.includes("insurance") || lower.includes("delta") || lower.includes("metlife")) {
          reply = `Yes! We accept Delta Dental, MetLife, Cigna, Aetna, and most major PPO insurance plans. We file insurance claims directly on your behalf.`;
        } else {
          reply = `Thank you for asking about ${botName}! According to our verified knowledge base, we specialize in providing high quality care and services. Would you like to know our pricing, hours, or book a consultation?`;
        }
      }

      setTestMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 400);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setSuggestedQuestions((prev) => [...prev, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTemplate =
    Object.values(INDUSTRY_TEMPLATES).find((t) => t.id === selectedTemplateId) ||
    INDUSTRY_TEMPLATES.dental;

  return (
    <div className="space-y-6">
      {/* Template Notification Banner */}
      {templateNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{templateNotice}</span>
          </div>
          <button
            onClick={() => setTemplateNotice(null)}
            className="text-emerald-400/80 hover:text-emerald-400 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Turnkey Template Switcher Bar */}
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Turnkey Industry Template:</span>
              <Badge variant="outline" className="text-[11px] font-semibold bg-background/80 text-foreground border-accent/40">
                {currentTemplate.name}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Includes {currentTemplate.qaPairs.length} verified FAQs, {currentTemplate.suggestedQuestions.length} prompt chips & auto-lead actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              const tpl = Object.values(INDUSTRY_TEMPLATES).find((t) => t.id === e.target.value);
              if (tpl) applyTemplate(tpl, true);
            }}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {Object.values(INDUSTRY_TEMPLATES).map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.industry.replace("_", " ")})
              </option>
            ))}
          </select>
          <Link href="/dashboard/templates">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
              <span>All Templates</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple vs Pro Mode Helper */}
      <div className="rounded-xl border border-border/70 bg-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15 text-accent text-xs font-bold">
            {uiMode === "simple" ? "✨" : "⚙️"}
          </span>
          <span className="text-xs text-foreground font-medium">
            {uiMode === "simple" ? (
              <>
                <strong>Simple View:</strong> Easy setup for your bot name, greeting, quick questions & appearance.
              </>
            ) : (
              <>
                <strong>Pro View:</strong> Full system prompt, temperature tuning, and webhook endpoints exposed.
              </>
            )}
          </span>
        </div>
        <button
          onClick={toggleUiMode}
          className="text-xs text-accent hover:underline font-bold shrink-0 self-start sm:self-center"
        >
          {uiMode === "simple" ? "Switch to Pro View →" : "Switch to Simple View →"}
        </button>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-foreground">{botName}</h2>
            <Badge variant={isActive ? "success" : "secondary"} className="text-[10px]">
              {isActive ? "Active • Live" : "Paused"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Public ID: <span className="font-mono text-foreground font-semibold">{botSlug}</span> • Connected to Web Widget & WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/chat/${botSlug}?brand=${encodeURIComponent(botName)}`} target="_blank">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 border-border/80">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Test Public Demo</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("embed")}
            className="h-8 text-xs font-semibold gap-1.5 border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent"
          >
            <Code className="h-3.5 w-3.5" />
            <span>Website Embed Script</span>
          </Button>

          <Link href="/dashboard/wizard">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-accent text-accent-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Creation Wizard</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsActive(!isActive)}
            className="h-8 text-xs gap-1.5"
          >
            {isActive ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause Bot
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" /> Activate
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" /> Saved!
              </>
            ) : (
              <span>Save Bot</span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Tabs on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-border/60 text-xs font-semibold gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === "general"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("personality")}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === "personality"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" /> Personality & Instructions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === "appearance"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="h-3.5 w-3.5" /> Appearance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("language")}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === "language"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Language
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("embed")}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === "embed"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code className="h-3.5 w-3.5 text-accent" />
              <span>Website Embed Code</span>
              <span className="text-[9px] bg-accent/20 text-accent px-1 rounded font-mono">1-Click</span>
            </button>
          </div>

          {/* Tab 1: General */}
          {activeTab === "general" && (
            <Card className="border-border/70 shadow-sm text-xs space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Chatbot Name</label>
                <Input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. Apex Dental Assistant"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Internal Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe where this bot is deployed"
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">Status</div>
                  <div className="text-[11px] text-muted-foreground">
                    When active, your bot answers customer chats 24/7 on website and connected channels.
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setIsActive(!isActive)}
                  className="h-8 text-xs"
                >
                  {isActive ? "Enabled" : "Paused"}
                </Button>
              </div>
            </Card>
          )}

          {/* Tab 2: Personality & Instructions */}
          {activeTab === "personality" && (
            <Card className="border-border/70 shadow-sm text-xs space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Tone of Voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="friendly">Friendly & Warm</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="enthusiastic">Enthusiastic & High-Energy</option>
                    <option value="concise">Concise & Direct</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="font-semibold text-foreground">Creativity (Temp)</label>
                    <span className="font-mono text-muted-foreground">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-foreground cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Strict (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">System Instructions & Behavior</label>
                <Textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Zero-Hallucination Fallback Message
                </label>
                <Textarea
                  rows={2}
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  placeholder="Message sent when the answer is not in your knowledge base"
                  className="text-xs"
                />
                <span className="text-[11px] text-muted-foreground">
                  Returned whenever confidence is low. Always prompts for customer contact details.
                </span>
              </div>
            </Card>
          )}

          {/* Tab 3: Appearance */}
          {activeTab === "appearance" && (
            <Card className="border-border/70 shadow-sm text-xs space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Widget Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Widget Position</label>
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="bottom-right">Bottom Right (Standard)</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Welcome Greeting Message</label>
                <Textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="font-semibold text-foreground">Suggested Question Chips</label>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/30 px-3 py-1.5">
                      <span className="text-xs text-foreground">{q}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSuggestedQuestions((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-muted-foreground hover:text-destructive text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Add another prompt chip..."
                      className="h-8 text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleAddQuestion} className="h-8 text-xs shrink-0">
                      Add Chip
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 4: Language */}
          {activeTab === "language" && (
            <Card className="border-border/70 shadow-sm text-xs space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Primary Language & Detection</label>
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="auto">Auto-Detect Language (Recommended — 95+ languages)</option>
                  <option value="en">English (Strict)</option>
                  <option value="es">Spanish</option>
                  <option value="ur">Urdu (اردو - Native RTL)</option>
                  <option value="ar">Arabic (العربية - Native RTL)</option>
                  <option value="fr">French</option>
                </select>
                <span className="text-[11px] text-muted-foreground">
                  Auto-Detect responds in whatever language the customer types in, preserving native RTL formatting for Urdu and Arabic.
                </span>
              </div>
            </Card>
          )}

          {/* Tab 5: Website Embed Code (Always accessible in Chatbot Studio) */}
          {activeTab === "embed" && (
            <Card className="border-border/70 shadow-sm text-xs space-y-5 p-5 animate-in fade-in">
              <div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold text-foreground">Website Widget Embed Script</h3>
                  <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30 ml-auto">
                    Active 24/7
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Copy and paste this single line of code into your website before the closing <code className="text-foreground font-mono">&lt;/body&gt;</code> tag. Whenever you edit your bot name or color, your live widget updates automatically without needing a new script!
                </p>
              </div>

              {/* Code Box */}
              <div className="rounded-xl border border-border/70 bg-muted/80 p-4 font-mono text-xs text-foreground relative overflow-x-auto space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[11px] text-muted-foreground font-sans font-semibold">HTML Snippet</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(embedSnippet);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                    }}
                    className="h-7 text-xs gap-1.5 font-bold"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </Button>
                </div>
                <pre className="text-xs text-foreground py-1">{embedSnippet}</pre>
              </div>

              {/* Step-by-Step Platform Guides */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="font-bold text-foreground block">Quick Setup Instructions:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-1">
                    <span className="font-bold text-foreground">WordPress / WooCommerce</span>
                    <p className="text-[11px] text-muted-foreground">
                      Install the free &ldquo;Header and Footer Scripts&rdquo; plugin or add inside your theme&rsquo;s <code className="text-foreground font-mono">footer.php</code> before <code className="text-foreground font-mono">&lt;/body&gt;</code>.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-1">
                    <span className="font-bold text-foreground">Shopify</span>
                    <p className="text-[11px] text-muted-foreground">
                      Go to Online Store &gt; Themes &gt; Edit Code &gt; <code className="text-foreground font-mono">theme.liquid</code>. Paste right above the closing <code className="text-foreground font-mono">&lt;/body&gt;</code> tag.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-1">
                    <span className="font-bold text-foreground">Webflow</span>
                    <p className="text-[11px] text-muted-foreground">
                      Go to Project Settings &gt; Custom Code &gt; Footer Code. Paste the snippet and click Save & Publish.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-1">
                    <span className="font-bold text-foreground">Wix & Squarespace</span>
                    <p className="text-[11px] text-muted-foreground">
                      Go to Settings &gt; Custom Code / Advanced &gt; Add Custom Code &gt; Place in Body - End.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Live Simulation Canvas: 5 Columns */}
        <div className="lg:col-span-5 rounded-2xl border border-border/70 bg-background shadow-xl overflow-hidden flex flex-col h-[520px] sticky top-24">
          {/* Header */}
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs backdrop-blur-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold leading-none">{botName}</div>
                <div className="text-[10px] text-white/80 mt-0.5">
                  Live Preview
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-white/30 text-white text-[10px]">
              Active
            </Badge>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {testMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                    msg.sender === "user"
                      ? "text-white font-medium"
                      : "bg-secondary text-secondary-foreground border border-border/60"
                  }`}
                  style={msg.sender === "user" ? { backgroundColor: primaryColor } : {}}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Chips */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto border-t border-border/40">
            {suggestedQuestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTestInput(chip)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendTest} className="p-3 border-t border-border/60 flex gap-2">
            <Input
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Test your bot's reply..."
              className="h-9 text-xs"
            />
            <Button type="submit" size="sm" className="h-9 px-3 gap-1" style={{ backgroundColor: primaryColor }}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
          Loading Chatbot Studio...
        </div>
      }
    >
      <ChatbotBuilderContent />
    </Suspense>
  );
}
