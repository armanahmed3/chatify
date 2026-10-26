import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Enterprise Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");

  const pathname = request.nextUrl.pathname;

  // Frame protection: Allow embedding only for customer chat widget demo
  if (pathname.startsWith("/chat/")) {
    response.headers.set("X-Frame-Options", "ALLOWALL");
  } else {
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }

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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
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
  } catch (err) {
    // If Supabase network request fails in development
  }

  // In local development with placeholder Supabase credentials or demo flag, allow dashboard preview
  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

  const demoCookie = request.cookies.get("chatify_demo_session")?.value;
  const isDevDemo = process.env.NODE_ENV === "development" && demoCookie === "active";

  if (isDevDemo || (process.env.NODE_ENV === "development" && isPlaceholderSupabase)) {
    return response;
  }

  // Protect /dashboard and /admin routes if not authenticated
  if (
    !user &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/chatbots") ||
      pathname.startsWith("/inbox") ||
      pathname.startsWith("/leads") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/admin"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Protect internal mutation APIs if not authenticated
  const isPublicApi =
    pathname.startsWith("/api/chat/") ||
    pathname.startsWith("/api/channels/") ||
    pathname.startsWith("/api/billing/webhook") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/tracking/") ||
    pathname === "/api/crawl" ||
    pathname === "/api/health";

  if (!user && !isDevDemo && !isPlaceholderSupabase && pathname.startsWith("/api/") && !isPublicApi) {
    return NextResponse.json(
      { error: "Authentication required for this endpoint" },
      { status: 401 }
    );
  }

  return response;
}
