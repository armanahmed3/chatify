import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2 text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Flat-Rate Pricing Guarantee</h2>
          <p>
            Chatify provides flat-rate monthly subscriptions with zero per-message charges and zero surprise overages. When monthly AI chat limits are reached, chatbots gracefully continue operating in offline lead capture mode.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Acceptable Use & Conduct</h2>
          <p>
            Users agree not to deploy chatbots for deceptive, illegal, or abusive operations. Inbound messages from end-users are subject to automated rate limiting and abuse mitigation filters.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Cancellation & Refunds</h2>
          <p>
            Subscriptions can be canceled at any time from your Billing dashboard. Access remains active through the end of the paid billing period.
          </p>
        </section>
      </div>
    </div>
  );
}
