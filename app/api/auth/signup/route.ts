import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  isDisposableEmail,
  validateEmailDomainMx,
  validateEmailSecurity,
  normalizeEmail,
  normalizePhoneNumber,
  evaluatePasswordStrength,
  computeDeviceFingerprint,
  checkTrialEligibility,
  recordActivatedTrial,
  issueOtp,
  consumeOtp,
} from "@/lib/security/anti-abuse";
import { getClientIp, serverError, escapeHtml } from "@/lib/http";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { registerUser, isLocalUserStoreEnabled } from "@/lib/auth/user-store";
import { logger } from "@/lib/logger";

const IS_PROD = process.env.NODE_ENV === "production";
/** Phone SMS verification is only enforced once an SMS provider is wired up. */
const SMS_VERIFICATION_ENABLED = process.env.SMS_VERIFICATION_ENABLED === "true";
import { Resend } from "resend";

const signupActionSchema = z.object({
  step: z.enum(["request_otp", "verify_and_signup"]),
  businessName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(30).regex(/^[+\d\s().-]+$/, "Invalid phone number."),
  password: z.string().min(8).max(100),
  emailOtpCode: z.string().max(6).optional(),
  phoneOtpCode: z.string().max(6).optional(),
  otpCode: z.string().max(6).optional(),
  deviceToken: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown-agent";

    // Rate limit signup attempts (max 20 per 15 minutes per IP)
    const rateCheck = await checkRateLimit(clientIp, "AUTH_SIGNUP");
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many signup requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = signupActionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      step,
      businessName,
      email,
      phone,
      password,
      emailOtpCode,
      phoneOtpCode,
      otpCode,
      deviceToken,
    } = parsed.data;

    // 1. Strict email integrity check (blocks + aliases like mudasirit+1@gmail.com and disposable domains)
    const emailSecurity = validateEmailSecurity(email);
    if (!emailSecurity.valid) {
      return NextResponse.json(
        { error: emailSecurity.error },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhoneNumber(phone);

    const mxCheck = await validateEmailDomainMx(normalizedEmail);
    if (!mxCheck.valid) {
      return NextResponse.json(
        {
          error:
            mxCheck.reason ||
            "The email domain provided cannot receive emails or is recognized as temporary. Please provide a valid work or personal email.",
        },
        { status: 400 }
      );
    }

    // 2. Strong password verification
    const passCheck = evaluatePasswordStrength(password);
    if (!passCheck.isValid) {
      return NextResponse.json(
        { error: passCheck.errors[0] || "Password does not meet security requirements." },
        { status: 400 }
      );
    }

    // 3. Compute device fingerprint
    const deviceHash = computeDeviceFingerprint(userAgent, clientIp, deviceToken);

    // 4. Check Trial Abuse / Eligibility
    const trialCheck = checkTrialEligibility({
      email: normalizedEmail,
      phone: normalizedPhone,
      deviceHash,
    });

    if (!trialCheck.eligible) {
      return NextResponse.json(
        {
          error: trialCheck.reason || "A 7-day free trial has already been claimed on this device or contact. Please log in or subscribe.",
          isTrialAbuse: true,
        },
        { status: 403 }
      );
    }

    // STEP A: Request INDIVIDUAL Verification OTPs for both Email and Phone
    if (step === "request_otp") {
      const emailOtp = await issueOtp(normalizedEmail);
      const phoneOtp = SMS_VERIFICATION_ENABLED || !IS_PROD ? await issueOtp(normalizedPhone) : null;

      let realEmailDelivered = false;
      let emailDeliveryNotice: string | null = null;

      // Real-time email dispatch via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
          const res = await resend.emails.send({
            from: from.includes("@") ? from : "onboarding@resend.dev",
            to: normalizedEmail,
            subject: "Your Chatify verification code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Chatify Verification</h1>
                  <p style="color: #64748b; font-size: 13px; margin-top: 4px;">7-Day Free Trial Business Onboarding</p>
                </div>
                <p style="color: #334155; font-size: 14px; line-height: 1.5;">
                  Hello, enter the following single-use 6-digit verification code to verify your business email:
                </p>
                <div style="text-align: center; margin: 24px 0;">
                  <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; padding: 12px 28px; background: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1;">
                    ${emailOtp}
                  </div>
                </div>
                <p style="color: #64748b; font-size: 12px; text-align: center;">
                  ⏳ Valid for 5 minutes. If you did not request this, please disregard.
                </p>
              </div>
            `,
          });
          if (!res.error) {
            realEmailDelivered = true;
          } else {
            logger.warn("Verification email rejected by provider", { reason: res.error.message });
            emailDeliveryNotice = "Email could not be delivered.";
          }
        } catch (e: any) {
          logger.error("Verification email dispatch failed", e);
          emailDeliveryNotice = "Email dispatch failed.";
        }
      }

      if (IS_PROD && !realEmailDelivered) {
        return NextResponse.json(
          { error: "We couldn't send your verification email right now. Please try again shortly." },
          { status: 503 }
        );
      }

      return NextResponse.json({
        ok: true,
        step: "otp_sent",
        message: "Verification code sent. Please check your inbox.",
        realEmailDelivered,
        emailDeliveryNotice: IS_PROD ? null : emailDeliveryNotice,
        phoneVerificationRequired: !!phoneOtp,
        // Codes are ONLY echoed back in local development. Never in production.
        ...(IS_PROD ? {} : { devEmailOtp: emailOtp, devPhoneOtp: phoneOtp, devOtp: emailOtp }),
      });
    }

    // STEP B: Verify BOTH Email OTP and Phone OTP Individually & Activate Multi-Dashboard Account
    if (step === "verify_and_signup") {
      const finalEmailOtp = (emailOtpCode || otpCode || "").trim();
      const finalPhoneOtp = (phoneOtpCode || otpCode || "").trim();

      if (finalEmailOtp.length !== 6) {
        return NextResponse.json(
          { error: "Please enter the 6-digit Email verification code.", field: "emailOtp" },
          { status: 400 }
        );
      }

      const phoneRequired = SMS_VERIFICATION_ENABLED || !IS_PROD;
      if (phoneRequired && finalPhoneOtp.length !== 6) {
        return NextResponse.json(
          { error: "Please enter the 6-digit Phone SMS verification code.", field: "phoneOtp" },
          { status: 400 }
        );
      }

      // 1. Verify Email OTP individually
      {
        const emailValidation = await consumeOtp(normalizedEmail, finalEmailOtp);
        if (!emailValidation.valid) {
          return NextResponse.json(
            { error: `Email verification failed: ${emailValidation.error}`, field: "emailOtp" },
            { status: 400 }
          );
        }
      }

      // 2. Verify Phone OTP individually
      if (phoneRequired) {
        const phoneValidation = await consumeOtp(normalizedPhone, finalPhoneOtp);
        if (!phoneValidation.valid) {
          return NextResponse.json(
            { error: `Phone SMS verification failed: ${phoneValidation.error}`, field: "phoneOtp" },
            { status: 400 }
          );
        }
      }

      // Record durable trial in ledger to prevent repeated free trials
      const trialRecord = recordActivatedTrial({
        email: normalizedEmail,
        phone: normalizedPhone,
        deviceHash,
        businessName,
      });

      // 3a. PRODUCTION: Supabase Auth user + isolated workspace + owner membership.
      if (!isLocalUserStoreEnabled()) {
        const admin = createAdminClient();
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true, // email ownership was proven by the OTP above
          user_metadata: {
            business_name: businessName,
            phone: normalizedPhone,
            trial_id: trialRecord.id,
            trial_expires_at: trialRecord.trialExpiresAt,
            plan: "starter_trial",
          },
        });
        if (createErr || !created.user) {
          logger.warn("Supabase signup failed", { reason: createErr?.message });
          // Generic message: avoid account enumeration.
          return NextResponse.json(
            { error: "We couldn't create your account. If you already have one, please log in." },
            { status: 400 }
          );
        }

        const slug =
          businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) +
          "-" +
          crypto.randomUUID().slice(0, 6);
        const { data: ws, error: wsErr } = await admin
          .from("workspaces")
          .insert({ name: businessName, slug })
          .select()
          .single();
        if (wsErr || !ws) {
          await admin.auth.admin.deleteUser(created.user.id);
          return serverError(wsErr, "auth.signup.workspace");
        }
        await admin
          .from("workspace_members")
          .insert({ workspace_id: ws.id, user_id: created.user.id, role: "owner" });

        // Establish the session (httpOnly cookies via @supabase/ssr).
        const supabase = await createClient();
        await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

        logger.audit("user.signup.success", { userId: created.user.id, workspaceId: ws.id, ip: clientIp });

        return NextResponse.json({
          ok: true,
          success: true,
          message: "Email verified! Your dedicated workspace is active.",
          trialDays: 7,
          trialExpiresAt: trialRecord.trialExpiresAt,
          businessName,
          user: { id: created.user.id, email: normalizedEmail, name: businessName, role: "user" },
          workspace: ws,
          workspaces: [ws],
        });
      }

      // 3b. DEVELOPMENT sandbox: in-memory user + workspace.
      const { user: newUser, workspace: newWorkspace } = registerUser({
        email: normalizedEmail,
        phone: normalizedPhone,
        businessName,
        password,
      });

      const response = NextResponse.json({
        ok: true,
        success: true,
        message: "Verified successfully! Your dedicated workspace is active.",
        trialDays: 7,
        trialExpiresAt: trialRecord.trialExpiresAt,
        businessName,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        workspace: newWorkspace,
        workspaces: newUser.workspaces,
      });

      response.cookies.set("chatify_demo_session", "active", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });
      response.cookies.set("chatify_active_ws", newWorkspace.id, {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid signup step." }, { status: 400 });
  } catch (err) {
    return serverError(err, "auth.signup");
  }
}
