import { BookOpen, Users, MessageSquare, Bell, Globe, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: BookOpen, title: "Learns from your content", text: "Reads your website pages, documents and the questions and answers you add." },
  { icon: ShieldCheck, title: "Says when it doesn't know", text: "Instead of guessing, it asks the customer for their contact details so you can reply." },
  { icon: Users, title: "Collects leads", text: "Names, phone numbers and emails from interested customers are saved in one list." },
  { icon: Bell, title: "Email alerts", text: "Get an email when someone asks to book or wants a quote." },
  { icon: MessageSquare, title: "All chats in one place", text: "Read every conversation and reply yourself when you need to." },
  { icon: Globe, title: "Speaks your customers' language", text: "Replies in the language the customer writes in, including Urdu and Arabic." },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border/40 py-16 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">What it does</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-accent" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
