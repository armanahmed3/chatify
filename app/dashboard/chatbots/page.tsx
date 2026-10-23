"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function ChatbotBuilderPage() {
  const [activeTab, setActiveTab] = useState<"general" | "personality" | "appearance" | "language">("general");

  // Bot state
  const [botName, setBotName] = useState("Apex Dental Assistant");
  const [description, setDescription] = useState("Main customer service & appointment booking bot");
  const [isActive, setIsActive] = useState(true);
  const [personality, setPersonality] = useState("helpful, professional, and empathetic");
  const [tone, setTone] = useState("friendly");
  const [temperature, setTemperature] = useState(0.3);
  const [instructions, setInstructions] = useState(
    "You are the virtual receptionist for Apex Dental Clinic. Welcome visitors warmly, answer questions accurately regarding services, dental insurance (Delta Dental, MetLife), hours, and emergency care. Offer appointment booking slots whenever appropriate. Never invent clinical diagnoses or arbitrary prices."
  );
  const [fallbackMessage, setFallbackMessage] = useState(
    "I don't have the exact details on that right now. Please leave your phone number and Dr. Sarah's team will get back to you right away!"
  );
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! Welcome to Apex Dental Clinic. How can I assist you with your smile today?"
  );
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Do you accept Delta Dental?",
    "How much is teeth cleaning?",
    "Can I book an appointment?",
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [saved, setSaved] = useState(false);

  // Live simulation chat inside builder
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState([
    { sender: "bot", text: welcomeMessage },
  ]);

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput;
    setTestInput("");
    setTestMessages((prev) => [...prev, { sender: "user", text: userText }]);

    setTimeout(() => {
      let reply = "Yes, we accept Delta Dental and MetLife insurance! Would you like to check a specific treatment?";
      if (userText.toLowerCase().includes("cleaning") || userText.toLowerCase().includes("cost")) {
        reply = "Our comprehensive adult cleaning and exam is $95 for new patients. We also offer interest-free payment plans.";
      } else if (userText.toLowerCase().includes("book") || userText.toLowerCase().includes("appointment")) {
        reply = "I would be happy to schedule that for you. We have openings tomorrow at 11:00 AM or Thursday at 2:00 PM. What time works best?";
      }
      setTestMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 500);
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

  return (
    <div className="space-y-6">
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
            Public ID: <span className="font-mono text-foreground font-semibold">demo-apex</span> • Connected to Web Widget & WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <div className="flex border-b border-border/60 text-xs font-semibold gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
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
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
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
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
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
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "language"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Language
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
