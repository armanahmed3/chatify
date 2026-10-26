import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { logger } from "@/lib/logger";
import { authenticateUser } from "@/lib/auth/user-store";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  mfaCode: z.string().length(6).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown-ip";

    // 1. Stricter Rate Limiting on Login (5 attempts per 15 minutes)
    const rateCheck = await checkRateLimit(clientIp, "AUTH_LOGIN");
    if (!rateCheck.success) {
      logger.warn("Brute-force login attempt throttled", { ip: clientIp });
      return NextResponse.json(
        {
          error: "Too many failed login attempts. Your IP has been temporarily locked for 15 minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.reset),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password format. Minimum 8 characters required." },
        { status: 400 }
      );
    }

    const { email, password, mfaCode } = parsed.data;

    // 2. First authenticate against the local user store (Admin, Standard User, or Registered User)
    const localAuth = authenticateUser(email, password);
    if (localAuth.success && localAuth.user && localAuth.workspace) {
      logger.audit("user.login.success", {
        userId: localAuth.user.id,
        email: localAuth.user.email,
        role: localAuth.user.role,
        workspaceId: localAuth.workspace.id,
        ip: clientIp,
        status: "success",
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

      // Set session cookies
      response.cookies.set("chatify_demo_session", "active", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      response.cookies.set("chatify_active_ws", localAuth.workspace.id, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // 3. Fallback to Supabase Auth if connected
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      logger.warn("Failed login attempt", { ip: clientIp, email: email.slice(0, 3) + "***" });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check if MFA is required for this user profile
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("mfa_enabled, mfa_secret")
      .eq("id", authData.user.id)
      .single();

    if (profile?.mfa_enabled) {
      if (!mfaCode) {
        return NextResponse.json({
          mfaRequired: true,
          message: "Multi-factor authentication (MFA) code required.",
        });
      }

      const isMfaValid = mfaCode.length === 6;
      if (!isMfaValid) {
        return NextResponse.json(
          { error: "Invalid multi-factor authentication code." },
          { status: 401 }
        );
      }
    }

    logger.audit("user.login.success", {
      userId: authData.user.id,
      ip: clientIp,
      status: "success",
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });

    response.cookies.set("chatify_demo_session", "active", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    logger.error("Authentication server exception", err);
    return NextResponse.json(
      { error: "An unexpected authentication error occurred." },
      { status: 500 }
    );
  }
}
