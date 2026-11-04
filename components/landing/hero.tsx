import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const EXAMPLE = [
  { from: "customer", text: "Are you open on Saturday?" },
  { from: "bot", text: "Yes, we're open Saturday from 9am to 2pm." },
  { from: "customer", text: "Can I book a cleaning?" },
  { from: "bot", text: "Sure! Leave your name and phone number and the team will call you to confirm a time." },
];

export function LandingHero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container grid max-w-6xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            A chatbot that answers your customers while you're busy.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Add your website link or type in your prices and opening hours. The chatbot learns your business,
            answers common questions, and collects contact details from people who want to book.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Create your chatbot <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                How it works
              </Button>
            </Link>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {["No coding needed", "7-day free trial, no card required", "Works on any website"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">Example conversation</div>
          <div className="space-y-3 p-4 text-sm">
            {EXAMPLE.map((m, i) => (
              <div key={i} className={m.from === "customer" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.from === "customer"
                      ? "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                      : "max-w-[80%] rounded-lg border border-border bg-secondary px-3 py-2"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
