"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Copy,
  Check,
  Globe,
  Share2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function CopySnippetBox({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
        <span>{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-accent hover:underline font-mono"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied to clipboard!" : "Copy code"}</span>
        </button>
      </div>
      <div className="relative rounded-lg border border-border/80 bg-background/80 p-3 font-mono text-[11px] text-foreground overflow-x-auto">
        <code>{code}</code>
      </div>
    </div>
  );
}

export default function ChannelsAndInstallPage() {
  const [activeTab, setActiveTab] = useState<"widget" | "whatsapp" | "social">("widget");

  const scriptTagCode = `<script src="${typeof window !== "undefined" ? window.location.origin : "https://chatify.ai"}/widget.js" data-bot="demo-apex" async></script>`;
  const iframeCode = `<iframe src="${typeof window !== "undefined" ? window.location.origin : "https://chatify.ai"}/chat/demo-apex" width="100%" height="600" frameborder="0"></iframe>`;
  const directLink = `${typeof window !== "undefined" ? window.location.origin : "https://chatify.ai"}/chat/demo-apex`;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Deploy & Connect Channels
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Put your AI chatbot on your website, WhatsApp, Instagram, and Facebook in minutes.
        </p>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex border-b border-border/60 text-xs font-semibold gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("widget")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "widget"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 className="h-4 w-4" /> Website Embed Widget
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "whatsapp"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> WhatsApp Cloud API
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "social"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className="h-4 w-4" /> Instagram DM & Messenger
        </button>
      </div>

      {/* Tab 1: Website Widget */}
      {activeTab === "widget" && (
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent" />
                <span>One-Line Script Tag (Recommended)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Paste this script tag right before the closing &lt;/body&gt; tag of your website. Works instantly on WordPress, Shopify, Webflow, Squarespace, and custom HTML.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CopySnippetBox code={scriptTagCode} label="Embed Script Tag" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="font-bold text-foreground">WordPress</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Paste into WPCode plugin or Theme Header & Footer settings.
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="font-bold text-foreground">Shopify</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Paste into theme.liquid before &lt;/body&gt;.
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                  <div className="font-bold text-foreground">Webflow & Squarespace</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Paste into Custom Code footer section.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Direct Standalone Chat Link</CardTitle>
              <CardDescription className="text-xs">
                Share this link directly in your email signature, Google Business Profile, or Instagram bio link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <CopySnippetBox code={directLink} label="Public Chat URL" />
              <div className="flex gap-2">
                <a href={directLink} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <span>Open in new tab</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: WhatsApp Cloud API */}
      {activeTab === "whatsapp" && (
        <Card className="border-border/70 shadow-sm space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>WhatsApp Business Cloud API</span>
                <Badge variant="success" className="text-[10px]">Official Meta Partner API</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Connect your official Meta WhatsApp Business phone number. Inbound customer chats are automatically answered by your trained AI and captured in your Unified Inbox.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/40 text-xs">
            <CopySnippetBox
              code={`${typeof window !== "undefined" ? window.location.origin : "https://chatify.ai"}/api/channels/meta/webhook`}
              label="Meta Webhook Callback URL"
            />
            <CopySnippetBox code="chatify_meta_verify_secret_token" label="Webhook Verify Token" />

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Meta Official Setup Guide</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Create an app at <a href="https://developers.facebook.com" target="_blank" className="text-accent underline">developers.facebook.com</a> with WhatsApp product.</li>
                <li>Paste the Callback URL and Verify Token above into your Meta Webhooks tab.</li>
                <li>Subscribe to the <code className="text-foreground">messages</code> webhook event.</li>
                <li>Done! Any WhatsApp message sent to your business number flows into Chatify immediately.</li>
              </ol>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Instagram & Messenger */}
      {activeTab === "social" && (
        <Card className="border-border/70 shadow-sm space-y-4 p-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Instagram Direct Message & Facebook Messenger</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Turn social DMs into booked appointments. Answer inquiries from your Instagram followers 24/7.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/40 text-xs">
            <CopySnippetBox
              code={`${typeof window !== "undefined" ? window.location.origin : "https://chatify.ai"}/api/channels/meta/webhook`}
              label="Instagram / Messenger Webhook URL"
            />
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 space-y-2">
              <div className="font-semibold text-foreground">Permissions Required</div>
              <div className="flex gap-2 text-[11px]">
                <Badge variant="outline">pages_messaging</Badge>
                <Badge variant="outline">instagram_manage_messages</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
