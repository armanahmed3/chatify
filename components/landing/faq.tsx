"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Do I need any technical skills?",
      a: "No. You fill in a few forms and copy one line of code into your website. If someone else manages your website, send them that line.",
    },
    {
      q: "Do I need my own AI or API account?",
      a: "No. Everything runs on our side. You don't need to sign up anywhere else.",
    },
    {
      q: "What if a customer asks something the chatbot doesn't know?",
      a: "It tells them it doesn't have that information and asks for their name and phone number or email, so you can get back to them.",
    },
    {
      q: "Can I see what customers are asking?",
      a: "Yes. Every conversation is saved in your dashboard, and you can reply yourself.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes, 7 days with no credit card. After that you can pick a monthly plan or stop.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container max-w-4xl px-4 sm:px-8">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Clear Answers for Business Owners
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-base sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
