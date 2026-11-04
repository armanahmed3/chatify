const STEPS = [
  { title: "Tell it about your business", text: "Paste your website link, or type in your services, prices and opening hours." },
  { title: "Try it out", text: "Ask it questions in the dashboard and adjust the answers until you're happy." },
  { title: "Add it to your website", text: "Copy one line of code into your site. A chat bubble appears in the corner." },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/40 py-16 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-border bg-card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
