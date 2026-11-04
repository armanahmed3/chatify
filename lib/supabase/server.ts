import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Request-scoped Supabase client acting AS THE SIGNED-IN USER (RLS enforced).
 * Session JWTs live in httpOnly cookies managed by @supabase/ssr — never localStorage.
 */
export async function createClient() {
  let cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>> | null = null;
  try {
    const { cookies } = await import("next/headers");
    cookieStore = await cookies();
  } catch {
    cookieStore = null; // called outside a request scope (e.g. unit tests / scripts)
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore?.set(name, value, options));
        } catch {
          // Called from a Server Component: middleware refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client. BYPASSES RLS — server-only, use strictly after an explicit authorization check
 * (or for trusted background jobs such as verified webhooks). Never import into client components.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient(SUPABASE_URL, serviceKey || SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
