/**
 * Shared HTTP helpers for API routes.
 * - serverError(): logs the real error server-side, returns a generic message (no stack/DB detail leaks).
 * - getClientIp(): single, consistent client-IP resolution for rate limiting & audit.
 */
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function serverError(err: unknown, context: string, status = 500) {
  logger.error(`[${context}] unhandled error`, err);
  return NextResponse.json(
    { error: "Something went wrong. Please try again later." },
    { status }
  );
}

export function getClientIp(request: NextRequest | Request): string {
  const anyReq = request as any;
  return (
    anyReq.ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-ip"
  );
}

export const isProduction = () => process.env.NODE_ENV === "production";

export { escapeHtml } from "@/lib/security/escape";
