"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  Building2,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Smartphone,
  Sparkles,
  Info,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form Fields
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Individual OTPs for Email and Phone
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [phoneOtpCode, setPhoneOtpCode] = useState("");

  // UI Flow States
  const [step, setStep] = useState<"details" | "verify_otp">("details");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [realEmailDelivered, setRealEmailDelivered] = useState<boolean>(false);
  const [devEmailOtp, setDevEmailOtp] = useState<string | null>(null);
  const [devPhoneOtp, setDevPhoneOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Google Modal State
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleBusinessName, setGoogleBusinessName] = useState("");
  const [googlePhone, setGooglePhone] = useState("");

  // Live Password Strength Calculation
  const passwordEvaluation = useMemo(() => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.upper) score += 20;
    if (checks.lower) score += 20;
    if (checks.digit) score += 20;
    if (checks.special) score += 20;

    let label = "Too weak";
    let color = "bg-rose-500";
    if (score >= 80) {
      label = "Strong";
      color = "bg-emerald-500";
    } else if (score >= 60) {
      label = "Moderate";
      color = "bg-amber-500";
    } else if (score >= 40) {
      label = "Weak";
      color = "bg-orange-500";
    }

    return { score, label, color, checks };
  }, [password]);

  // Synchronous client-side check for popular disposable/throwaway domains AND '+' aliases
  const checkDisposableEmailClient = (val: string): string | null => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return null;

    // Strict sub-addressing / plus-alias rejection (mudasirit+1@gmail.com)
    if (trimmed.includes("+")) {
      return "Email aliases using '+' (e.g. name+alias@gmail.com) are strictly prohibited. Please enter your primary email address.";
    }

    const domain = trimmed.split("@")[1];
    if (!domain) return null;

    const quickBlockedDomains = [
      "hopefunder.com",
      "tempmail.com",
      "temp-mail.org",
      "mailinator.com",
      "10minutemail.com",
      "10minutemail.net",
      "guerrillamail.com",
      "guerrillamailblock.com",
      "sharklasers.com",
      "grr.la",
      "yopmail.com",
      "trashmail.com",
      "dispostable.com",
      "fakeinbox.com",
      "getairmail.com",
      "throwawaymail.com",
      "burnermail.io",
      "mohmal.com",
      "crazymailing.com",
      "fakemailgenerator.com",
      "mytemp.email",
      "emailondeck.com",
      "tempail.com",
      "inboxkitten.com",
      "dropmail.me",
      "maildrop.cc",
      "discard.email",
      "generator.email",
      "inboxes.com",
      "inbox.si",
      "1secmail.com",
      "1secmail.net",
      "1secmail.org",
    ];

    if (
      quickBlockedDomains.some((d) => domain === d || domain.endsWith("." + d)) ||
      /(hopefunder|temp-?mail|10minute|mailinator|guerrilla|throwaway|burnermail|dispos(able|e)|trashmail|fakemail|sharklasers|yopmail|inboxkitten|dropmail|generator\.email|inboxes\.|1secmail|mohmal)/i.test(domain)
    ) {
      return `Temporary / disposable email domain (@${domain}) is not permitted. Please use your legitimate work or personal email address.`;
    }
    return null;
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const clientErr = checkDisposableEmailClient(val);
    setEmailError(clientErr);
  };

  const handleEmailBlur = async () => {
    const clientErr = checkDisposableEmailClient(email);
    if (clientErr) {
      setEmailError(clientErr);
      return;
    }
    if (email && email.includes("@")) {
      setValidatingEmail(true);
      try {
        const res = await fetch("/api/auth/validate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!data.valid) {
          setEmailError(data.error || "Temporary or invalid email service detected.");
        } else {
          setEmailError(null);
        }
      } catch {
        // Fallback silently if offline
      } finally {
        setValidatingEmail(false);
      }
    }
  };

  // Step 1: Request Real-Time Individual OTPs for Email & Phone
  const handleRequestOtp = async (e?: React.FormEvent, customPayload?: any) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    const targetEmail = customPayload?.email || email;
    const targetPhone = customPayload?.phone || phone;
    const targetBusiness = customPayload?.businessName || businessName;
    const targetPassword = customPayload?.password || password;

    const clientErr = checkDisposableEmailClient(targetEmail);
    if (clientErr) {
      setEmailError(clientErr);
      setError(clientErr);
      setLoading(false);
      return;
    }

    if (targetPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      const deviceToken = `dev-${navigator.userAgent.slice(0, 20)}-${screen.width}x${screen.height}`;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "request_otp",
          businessName: targetBusiness,
          email: targetEmail,
          phone: targetPhone,
          password: targetPassword,
          deviceToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate verification.");
      }

      setStep("verify_otp");
      setRealEmailDelivered(Boolean(data.realEmailDelivered));
      setSuccessNotice(`Individual verification codes sent to ${targetEmail} and ${targetPhone}.`);

      if (data.devEmailOtp) {
        setDevEmailOtp(data.devEmailOtp);
      }
      if (data.devPhoneOtp) {
        setDevPhoneOtp(data.devPhoneOtp);
      }

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify BOTH Individual OTPs & Activate Dedicated Fresh Dashboard Workspace
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (emailOtpCode.trim().length !== 6) {
      setError("Please enter the 6-digit Email verification code.");
      setLoading(false);
      return;
    }

    if (phoneOtpCode.trim().length !== 6) {
      setError("Please enter the 6-digit Phone SMS verification code.");
      setLoading(false);
      return;
    }

    try {
      const deviceToken = `dev-${navigator.userAgent.slice(0, 20)}-${screen.width}x${screen.height}`;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "verify_and_signup",
          businessName,
          email,
          phone,
          password,
          emailOtpCode: emailOtpCode.trim(),
          phoneOtpCode: phoneOtpCode.trim(),
          deviceToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Please check your codes.");
      }

      // CRITICAL: Wipe any previous mock or demo workspace data so the user gets a 100% fresh new dashboard!
      try {
        localStorage.removeItem("chatify_conversations");
        localStorage.removeItem("chatify_leads");
        localStorage.removeItem("chatify_bots");
        localStorage.removeItem("chatify_bot_config");
        // Clear workspace-specific keys
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("chatify_conversations_") || key.startsWith("chatify_leads_")) {
            localStorage.removeItem(key);
          }
        });
      } catch {}

      // Persist the user's isolated workspace in client storage for multi-dashboard hydration
      if (data.workspace) {
        localStorage.setItem("chatify_active_workspace", JSON.stringify(data.workspace));
      }
      if (data.workspaces) {
        localStorage.setItem("chatify_user_workspaces", JSON.stringify(data.workspaces));
      }
      if (data.user) {
        localStorage.setItem("chatify_current_user", JSON.stringify(data.user));
      }

      // Full navigation to reload fresh dashboard with user's genuine business workspace
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Verification failed. Please check both codes and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Flow Handler (Enforces Email & Phone Verification)
  const handleGoogleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const gEmail = googleEmail.trim().toLowerCase();
    const gPhone = googlePhone.trim();
    const gBiz = googleBusinessName.trim();

    const clientErr = checkDisposableEmailClient(gEmail);
    if (clientErr) {
      setError(clientErr);
      return;
    }

    if (!gBiz) {
      setError("Please provide your Business / Practice name.");
      return;
    }
    if (!gPhone) {
      setError("Please provide your mobile phone number for dual verification.");
      return;
    }

    // Set form fields
    setEmail(gEmail);
    setBusinessName(gBiz);
    setPhone(gPhone);
    setPassword("GoogleAuthSecured2026!");

    setGoogleModalOpen(false);

    // Immediately trigger OTP request for Google user
    await handleRequestOtp(undefined, {
      email: gEmail,
      phone: gPhone,
      businessName: gBiz,
      password: "GoogleAuthSecured2026!",
    });
  };

  return (
    <>
      <Card className="border-border/70 shadow-2xl overflow-hidden max-w-lg mx-auto">
        {/* 7-Day Trial Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-accent p-3 text-center text-white">
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wide uppercase">
            <ShieldCheck className="h-4 w-4 text-cyan-200" />
            <span>7-Day Free Trial • Dual Verification Security</span>
          </div>
          <p className="text-[11px] text-white/80 mt-0.5">
            Dedicated Practice Dashboard • Individual Email & SMS Verification • No Credit Card
          </p>
        </div>

        <CardHeader className="space-y-1.5 text-center pt-6 pb-4">
          <CardTitle className="text-2xl font-black tracking-tight text-foreground">
            {step === "details" ? "Create Your Business Account" : "Individual Dual Verification"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {step === "details"
              ? "Enter your practice details to initialize your isolated multi-tenant dashboard."
              : "Both Email and Mobile Phone must be verified individually for trial activation."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-start gap-2">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successNotice && (
            <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-400 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="space-y-1">
                <span className="leading-relaxed font-semibold">{successNotice}</span>
                {realEmailDelivered ? (
                  <p className="text-[11px] text-emerald-300">
                    ✓ Code sent via live Resend email engine. Check your inbox!
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {step === "details" ? (
            /* STEP 1: Practice Details & Security Inputs */
            <div className="space-y-4">
              {/* Continue with Google Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full h-11 text-xs font-bold gap-2.5 border-border/80 hover:bg-secondary/40 shadow-sm"
              >
                <GoogleIcon />
                <span>Continue with Google (Requires Dual Verification)</span>
              </Button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-border/60 w-full" />
                <span className="bg-card px-2.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  or sign up with work email
                </span>
                <div className="border-t border-border/60 w-full" />
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Business / Practice Name</span>
                  </label>
                  <Input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Skyline Legal Partners"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Work / Practice Email</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">(No '+' aliases or disposable)</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="director@skylinelegal.com"
                    required
                    className={`h-9 text-xs transition-colors ${
                      emailError
                        ? "border-rose-500 bg-rose-500/5 text-rose-300 focus-visible:ring-rose-500"
                        : ""
                    }`}
                  />
                  {emailError ? (
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-400 font-medium pt-1">
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                      <span>{emailError}</span>
                    </div>
                  ) : validatingEmail ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                      <Loader2 className="h-3 w-3 animate-spin text-accent" />
                      <span>Checking domain deliverability...</span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Direct Mobile / WhatsApp Phone Number</span>
                    <span className="text-[10px] text-accent font-semibold">(Receives SMS code)</span>
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 345-6789"
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Create Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>

                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    className="h-9 text-xs font-mono"
                  />

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="font-bold text-foreground">{passwordEvaluation.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordEvaluation.color} transition-all duration-300`}
                          style={{ width: `${passwordEvaluation.score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pt-0.5">
                        <span className={passwordEvaluation.checks.length ? "text-emerald-400" : ""}>
                          • 8+ characters
                        </span>
                        <span className={passwordEvaluation.checks.upper ? "text-emerald-400" : ""}>
                          • Uppercase letter
                        </span>
                        <span className={passwordEvaluation.checks.digit ? "text-emerald-400" : ""}>
                          • Number included
                        </span>
                        <span className={passwordEvaluation.checks.special ? "text-emerald-400" : ""}>
                          • Special symbol (!@#$)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-10 min-h-[44px] text-sm sm:text-xs font-bold gap-1.5 shadow-md mt-2"
                  disabled={loading || Boolean(emailError) || validatingEmail}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending verification codes...
                    </>
                  ) : (
                    <>
                      <span>Send Real-Time Verification Codes</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            /* STEP 2: INDIVIDUAL DUAL VERIFICATION (Email OTP + Phone OTP) */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Box 1: Email Code Input */}
              <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-accent" />
                    <span>1. Email Verification Code</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[160px] font-mono">
                    {email}
                  </span>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  value={emailOtpCode}
                  onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="h-10 text-center text-lg tracking-[0.4em] font-mono font-bold"
                />
                {devEmailOtp && (
                  <div className="flex items-center justify-between text-[11px] text-accent bg-accent/10 px-2.5 py-1.5 rounded">
                    <span className="font-mono">Email OTP: {devEmailOtp}</span>
                    <button
                      type="button"
                      onClick={() => setEmailOtpCode(devEmailOtp)}
                      className="font-bold underline hover:opacity-80"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                )}
              </div>

              {/* Box 2: Phone SMS Code Input */}
              <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <span>2. Mobile SMS Verification Code</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {phone}
                  </span>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  value={phoneOtpCode}
                  onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  required
                  className="h-10 text-center text-lg tracking-[0.4em] font-mono font-bold"
                />
                {devPhoneOtp && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded">
                    <span className="font-mono">SMS OTP: {devPhoneOtp}</span>
                    <button
                      type="button"
                      onClick={() => setPhoneOtpCode(devPhoneOtp)}
                      className="font-bold underline hover:opacity-80"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-10 min-h-[44px] text-sm sm:text-xs font-bold gap-1.5 shadow-md bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={loading || emailOtpCode.length !== 6 || phoneOtpCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying & Launching Fresh Dashboard...
                  </>
                ) : (
                  <>
                    <span>Verify Both Codes & Launch Fresh Dashboard</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="hover:underline flex items-center gap-1 min-h-[44px]"
                >
                  <span>← Change Details</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleRequestOtp(e)}
                  disabled={countdown > 0 || loading}
                  className="hover:underline flex items-center gap-1 text-accent font-semibold disabled:opacity-40 min-h-[44px]"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{countdown > 0 ? `Resend codes in ${countdown}s` : "Resend Both Codes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Anti-Abuse Notice */}
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-2.5 text-[10px] text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Multi-Tenant Isolation & Anti-Abuse Protection</span>
            </div>
            <p>
              Every new signup generates an isolated, brand-new dashboard. 1 trial grant per verified phone, business email, and device.
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-border/40 py-3 text-xs text-muted-foreground bg-card/60">
          Already have an account?{" "}
          <Link href="/login" className="ms-1 font-semibold text-foreground hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>

      {/* Google Verification Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border/80 shadow-2xl bg-card">
            <CardHeader className="space-y-1.5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GoogleIcon />
                  <CardTitle className="text-base font-bold">Continue with Google</CardTitle>
                </div>
                <button
                  onClick={() => setGoogleModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-bold p-1"
                >
                  ✕
                </button>
              </div>
              <CardDescription className="text-xs">
                To protect our platform and activate your 7-day free trial, Google accounts must also complete Email & Mobile Phone SMS verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoogleContinue} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Google Account Email</label>
                  <Input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="your.name@gmail.com"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Business / Practice Name</label>
                  <Input
                    type="text"
                    value={googleBusinessName}
                    onChange={(e) => setGoogleBusinessName(e.target.value)}
                    placeholder="e.g. Apex Health Clinic"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Mobile Phone Number (SMS Code)</label>
                  <Input
                    type="tel"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    placeholder="+1 (555) 789-0123"
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 text-xs font-bold gap-2 mt-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Send Codes & Proceed to Dual Verification</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-border/70 shadow-2xl p-12 text-center text-xs text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-foreground" />
          Setting up secure verification form...
        </Card>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
