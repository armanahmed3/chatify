import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function createClient() {
  let cookieStore: any;
  try {
    const { cookies } = require("next/headers");
    cookieStore = cookies();
  } catch {
    cookieStore = { get: () => undefined, set: () => {}, remove: () => {} };
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return typeof cookieStore.getAll === "function" ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (typeof cookieStore.set === "function") {
                cookieStore.set(name, value, options);
              }
            });
          } catch {
            // Server Component cookie set error caught safely
          }
        },
      },
    }
  );
}

// Service role client bypasses RLS for administrative background routines (e.g. Stripe webhooks)
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-service-key",
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
