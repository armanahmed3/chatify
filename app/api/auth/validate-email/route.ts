import { NextRequest, NextResponse } from "next/server";
import {
  validateEmailSecurity,
  validateEmailDomainMx,
  normalizeEmail,
} from "@/lib/security/anti-abuse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ valid: false, error: "Invalid email address format." }, { status: 400 });
    }

    // 1. Check for plus aliases (mudasirit+1@gmail.com) and disposable domains
    const securityCheck = validateEmailSecurity(email);
    if (!securityCheck.valid) {
      return NextResponse.json({
        valid: false,
        disposable: true,
        error: securityCheck.error,
      });
    }

    const normalized = normalizeEmail(email);

    // 2. DNS MX deliverability check
    const mxCheck = await validateEmailDomainMx(normalized);
    if (!mxCheck.valid) {
      return NextResponse.json({
        valid: false,
        disposable: true,
        error: mxCheck.reason || "The domain cannot receive emails or is recognized as temporary.",
      });
    }

    return NextResponse.json({ valid: true, disposable: false });
  } catch {
    return NextResponse.json({ valid: true });
  }
}
