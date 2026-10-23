import Link from "next/link";
import { Bot } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/60 py-12 text-xs text-muted-foreground">
      <div className="container max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-bold text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <Bot className="h-4 w-4" />
            </div>
            <span className="text-base tracking-tight font-extrabold">Chatify</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} Chatify Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
