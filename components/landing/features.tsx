import {
  MessageSquare,
  ShieldCheck,
  CalendarCheck,
  Zap,
  Globe2,
  Users2,
  BellRing,
  PieChart,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: MessageSquare,
      title: "Omnichannel Unified Inbox",
      desc: "Connect your website widget, WhatsApp Cloud number, Instagram DMs, and Facebook Messenger into one single unified dashboard inbox.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Hallucination Guard",
      desc: "Answers strictly from your verified knowledge base. If information is missing, the bot politely falls back and captures the customer's phone number.",
    },
    {
      icon: CalendarCheck,
      title: "Native Booking & Actions",
      desc: "Allows customers to book appointments directly via Calendly or Google Calendar, generate discount coupons, or call custom REST webhooks.",
    },
    {
      icon: BellRing,
      title: "Smart Lead Qualification & Alerts",
      desc: "Automatically qualifies leads as Hot, Warm, or Cold based on intent keywords and sends instant email alerts to your phone on hot inquiries.",
    },
    {
      icon: Zap,
      title: "Answers-Before-AI Engine",
      desc: "Exact Q&A pairs and semantic cache match instantly in under 20ms with $0 cost, guaranteeing lightning-fast answers that never consume your quota.",
    },
    {
      icon: Globe2,
      title: "95+ Languages with Urdu & Arabic Support",
      desc: "Detects customer language automatically and responds natively, including complete RTL bidirectional formatting for Urdu and Arabic.",
    },
    {
      icon: Users2,
      title: "Seamless Human Agent Takeover",
      desc: "Step in and take over any conversation with one click from your phone or laptop. The AI bot pauses instantly until you release it back.",
    },
    {
      icon: PieChart,
      title: "Transparent Business ROI Analytics",
      desc: "Track exact hours saved by the bot and estimated revenue pipeline generated based on your business's average customer job value.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent">
            Engineered For Local Businesses
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Everything You Need to Turn Visitors Into Paying Clients
          </p>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            More capable than traditional chatbots, yet remarkably simple for non-technical teams.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:border-foreground/30 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground mb-4">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
