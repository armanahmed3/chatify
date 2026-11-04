import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { allowedOrigins } from "@/lib/env";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Public API surface. Everything else under /api requires an authenticated Supabase session.
 * - /api/chat/*         : embeddable widget (cross-origin, no cookies)
 * - /api/channels/*     : Meta webhooks (HMAC signature verified in the route)
 * - /api/billing/webhook: Stripe webhook (signature verified in the route)
 * - /api/auth/*         : login / signup / email validation
 * - /api/health         : liveness probe
 * - POST /api/tracking/events : widget visitor telemetry (GET is private)
 */
function isPublicApi(pathname: string, method: string) {
  if (pathname === "/api/tracking/events" && (method === "POST" || method === "OPTIONS")) return true;
  return (
    pathname.startsWith("/api/chat/") ||
    pathname.startsWith("/api/channels/") ||
    pathname === "/api/billing/webhook" ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/health"
  );
}

/** Endpoints that legitimately receive cross-site requests (no ambient cookie auth, or signed). */
function isCsrfExempt(pathname: string) {
  return (
    pathname === "/api/tracking/events" ||
    pathname.startsWith("/api/chat/") ||
    pathname.startsWith("/api/channels/") ||
    pathname === "/api/billing/webhook"
  );
}

function isProtectedPage(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

function clientIp(request: NextRequest) {
  return (
    (request as any).ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-ip"
  );
}

function isPlaceholderSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes("placeholder") || url.includes("your-project");
}

/** CSRF defence: state-changing requests must come from one of our own origins. */
function passesCsrfCheck(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || (referer ? safeOrigin(referer) : null);
  const allowed = new Set([request.nextUrl.origin, ...allowedOrigins().map(safeOrigin)]);
  if (!source) {
    // Browsers always send Origin on cross-site POST/PUT/PATCH/DELETE. A request with neither
    // Origin nor Referer is a non-browser client; it still needs a valid session cookie/JWT.
    return true;
  }
  return allowed.has(safeOrigin(source));
}

function safeOrigin(u: string): string | null {
  try {
    return new URL(u).origin;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");
  const isDev = process.env.NODE_ENV !== "production";

  // 1. Global rate limit on every API call (per-IP). Route handlers add stricter per-feature tiers.
  if (isApi) {
    const rl = await checkRateLimit(clientIp(request), "GENERAL_API");
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rl.reset) } }
      );
    }
  }

  // 2. CSRF protection for cookie-authenticated mutations.
  if (isApi && MUTATING_METHODS.has(request.method) && !isCsrfExempt(pathname)) {
    if (!passesCsrfCheck(request)) {
      return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
    }
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  // Local development convenience ONLY: never active when NODE_ENV=production.
  const demoCookie = request.cookies.get("chatify_demo_session")?.value === "active";
  if (isDev && (demoCookie || isPlaceholderSupabase())) {
    return response;
  }

  // 3. Lock down dashboard/admin pages.
  if (!user && isProtectedPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4. Check access on every private API request.
  if (!user && isApi && !isPublicApi(pathname, request.method)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return response;
}
