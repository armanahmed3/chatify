"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Store authenticated user and workspace state in client storage for real-time hydration
      if (data.workspace) {
        localStorage.setItem("chatify_active_workspace", JSON.stringify(data.workspace));
      }
      if (data.workspaces) {
        localStorage.setItem("chatify_user_workspaces", JSON.stringify(data.workspaces));
      }
      if (data.user) {
        localStorage.setItem("chatify_current_user", JSON.stringify(data.user));
      }

      // Navigate to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        window.location.href = "/signup?provider=google";
      }
    } catch {
      window.location.href = "/signup?provider=google";
    }
  };

  return (
    <Card className="border-border/70 shadow-2xl">
      <CardHeader className="space-y-1.5 text-center">
        <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In to Chatify</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your authorized credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              autoFocus
              className="h-11 sm:h-10 text-base sm:text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Password
              </label>
              <Link href="#" className="text-[11px] text-muted-foreground hover:text-foreground min-h-[44px] flex items-center">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-11 sm:h-10 text-base sm:text-xs"
            />
          </div>

          <Button type="submit" className="w-full h-11 sm:h-10 min-h-[44px] text-sm sm:text-xs font-semibold gap-1.5" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full h-11 sm:h-10 min-h-[44px] text-sm sm:text-xs font-medium"
        >
          <svg className="me-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Workspace Account
        </Button>
      </CardContent>
      <CardFooter className="justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="ms-1 font-semibold text-foreground hover:underline">
          Create free account
        </Link>
      </CardFooter>
    </Card>
  );
}
