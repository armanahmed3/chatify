import { Link2, Cpu, Rocket } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Link2,
      title: "Paste Your Website Link",
      description:
        "Or upload a price list PDF, paste custom text, or sync your Instagram/Facebook page. No technical skills or coding required.",
    },
    {
      step: "02",
      icon: Cpu,
      title: "AI Trains Itself in Seconds",
      description:
        "Our engine indexes your services, pricing, business hours, and policies into a secure knowledge base with zero hallucination protection.",
    },
    {
      step: "03",
      icon: Rocket,
      title: "Live Across All Channels in 5 Min",
      description:
        "Add one line of code to your website, or connect WhatsApp, Instagram DM, and Facebook Messenger to capture every customer inquiry 24/7.",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-border/40 py-20 md:py-28 bg-card/20">
      <div className="container max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent">
            Simple 3-Step Setup
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            From Zero to 24/7 AI Receptionist in 5 Minutes
          </p>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            No API keys. No complex configuration. Designed specifically for busy business owners.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-border/70 bg-card p-8 shadow-sm transition-all hover:border-foreground/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground border border-border/60">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <span className="font-mono text-3xl font-black text-muted-foreground/30">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-base sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
