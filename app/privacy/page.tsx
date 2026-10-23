import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2 text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Data Isolation & Multi-Tenancy</h2>
          <p>
            Chatify enforces strict Postgres Row-Level Security (RLS) on all customer documents, training data, and conversation history. Your business data is isolated to your designated workspace and is never accessed by, shared with, or used to train public third-party AI models without explicit consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Information Collected</h2>
          <p>
            When customers interact with your chatbot widget or connected messaging channels, Chatify processes message transcripts, timestamps, and customer-provided contact details (such as name, phone number, and email address) solely for lead qualification and response generation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. GDPR & CCPA Compliance</h2>
          <p>
            You retain 100% ownership of your business data. Workspace owners can generate a complete portable JSON export of all vectors, conversations, and customer records at any time, or request irreversible permanent erasure via our 1-click GDPR deletion pipeline.
          </p>
        </section>
      </div>
    </div>
  );
}
