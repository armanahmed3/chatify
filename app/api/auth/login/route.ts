import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { verifyTotp } from "@/lib/security/totp";
import { logger } from "@/lib/logger";
import { authenticateUser, isLocalUserStoreEnabled } from "@/lib/auth/user-store";
import { getClientIp, serverError } from "@/lib/http";

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  mfaCode: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

const GENERIC_AUTH_ERROR = "Invalid email or password.";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }
    const { email, password, mfaCode } = parsed.data;

    // 1. Brute-force lockdown: limit per IP AND per account (stops distributed credential stuffing).
    const [ipCheck, accountCheck] = await Promise.all([
      checkRateLimit(clientIp, "AUTH_LOGIN"),
      checkRateLimit(`acct:${email.toLowerCase()}`, "AUTH_LOGIN"),
    ]);
    if (!ipCheck.success || !accountCheck.success) {
      logger.warn("Login throttled", { ip: clientIp });
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(ipCheck.reset, accountCheck.reset)) },
        }
      );
    }

    // 2. Local sandbox accounts — DEVELOPMENT ONLY (disabled when NODE_ENV=production).
    if (isLocalUserStoreEnabled()) {
      const localAuth = authenticateUser(email, password);
      if (localAuth.success && localAuth.user && localAuth.workspace) {
        logger.audit("user.login.success", {
          userId: localAuth.user.id,
          workspaceId: localAuth.workspace.id,
          ip: clientIp,
          status: "success",
          mode: "dev-sandbox",
        });

        const response = NextResponse.json({
          ok: true,
          user: {
            id: localAuth.user.id,
            email: localAuth.user.email,
            name: localAuth.user.name,
            role: localAuth.user.role,
          },
          workspace: localAuth.workspace,
          workspaces: localAuth.user.workspaces,
        });
        response.cookies.set("chatify_demo_session", "active", {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });
        response.cookies.set("chatify_active_ws", localAuth.workspace.id, {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      }
    }

    // 3. Supabase Auth (production path). Session JWTs are stored in httpOnly cookies by @supabase/ssr,
    //    never in localStorage.
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      logger.warn("Failed login attempt", { ip: clientIp });
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // 4. Multi-factor authentication (RFC 6238 TOTP).
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("mfa_enabled, mfa_secret")
      .eq("id", authData.user.id)
      .single();

    if (profile?.mfa_enabled) {
      const mfaOk = !!mfaCode && verifyTotp(profile.mfa_secret, mfaCode);
      if (!mfaOk) {
        // Do NOT leave a half-authenticated session behind.
        await supabase.auth.signOut();
        if (!mfaCode) {
          return NextResponse.json({
            mfaRequired: true,
            message: "Enter the 6-digit code from your authenticator app.",
          });
        }
        logger.warn("Invalid MFA code", { userId: authData.user.id, ip: clientIp });
        return NextResponse.json({ error: "Invalid authentication code." }, { status: 401 });
      }
    }

    logger.audit("user.login.success", {
      userId: authData.user.id,
      ip: clientIp,
      status: "success",
    });

    return NextResponse.json({
      ok: true,
      user: { id: authData.user.id, email: authData.user.email },
    });
  } catch (err) {
    return serverError(err, "auth.login");
  }
}
