"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Do I need to sign up for OpenAI or enter any API keys?",
      a: "No! Chatify runs on our central, lifetime-free AI routing infrastructure. You will never be asked to create an OpenAI account, pay token bills, or touch API keys.",
    },
    {
      q: "What happens if a customer asks a question not on my website?",
      a: "Our Zero-Hallucination guard ensures the chatbot never invents false prices, hours, or services. Instead, it politely tells the customer it doesn't have that specific detail and offers to capture their phone number or email so you can reply personally.",
    },
    {
      q: "How does the flat pricing work? Are there really no message fees?",
      a: "Yes. Unlike Chatbase or CustomGPT who charge per message, Chatify plans are 100% flat. All FAQ and instant answers are unlimited and cost $0. Real smart AI chats are capped at your generous plan limit (e.g. 2,000/mo on Starter). If your limit is reached, your bot gracefully continues taking customer contact details without shutting down.",
    },
    {
      q: "Can I connect WhatsApp, Instagram, and Facebook Messenger?",
      a: "Yes! On our Pro plan and above, you can connect your official WhatsApp Cloud API number, Instagram DMs, and Facebook Messenger page. All customer conversations flow into your single Chatify unified inbox.",
    },
    {
      q: "Can my team take over the chat live when we are online?",
      a: "Absolutely. With 1-click Human Takeover, any conversation can be answered live by your staff. The AI bot pauses instantly and will only resume if you hand it back.",
    },
    {
      q: "Does the chatbot support Urdu, Arabic, and other languages?",
      a: "Yes! Chatify detects the visitor's language automatically and responds natively in over 95 languages, including full Right-to-Left (RTL) text alignment for Urdu and Arabic.",
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
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
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
