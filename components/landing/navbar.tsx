"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2.5 font-bold tracking-tight min-h-[44px]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Chatify</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#channels" className="text-muted-foreground transition-colors hover:text-foreground">
            WhatsApp & Social
          </Link>
          <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTA / Auth buttons & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5 shadow-md min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                <span>Start Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button (☰ / ✕) visible only below md (768px) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex md:hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border/70 bg-card text-foreground hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Full-width Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden border-b border-border/60 bg-background/98 backdrop-blur-lg px-4 pt-4 pb-6 shadow-2xl transition-all animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col space-y-1 text-base font-semibold">
            <Link
              href="#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              Features
            </Link>
            <Link
              href="#channels"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              WhatsApp & Social
            </Link>
            <Link
              href="#pricing"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center rounded-lg px-3 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              FAQ
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full min-h-[44px] text-sm font-semibold justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="w-full">
              <Button className="w-full min-h-[44px] text-sm font-bold gap-1.5 shadow-md justify-center">
                <span>Start Free (7-Day Trial)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
