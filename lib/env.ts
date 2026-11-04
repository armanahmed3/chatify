/**
 * Environment validation helpers (safe for server + edge runtimes; never import into client components).
 * Fails fast in production when critical secrets are missing or still set to placeholder values.
 */

const REQUIRED_IN_PRODUCTION = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

const PLACEHOLDER_PATTERN = /(placeholder|your-|changeme|example)/i;

export function missingProductionEnv(): string[] {
  return REQUIRED_IN_PRODUCTION.filter((k) => {
    const v = process.env[k];
    return !v || PLACEHOLDER_PATTERN.test(v);
  });
}

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = missingProductionEnv();
  if (missing.length) {
    throw new Error(`Missing/placeholder production environment variables: ${missing.join(", ")}`);
  }
}

/** Allowed browser origins for CSRF and CORS checks. */
export function allowedOrigins(): string[] {
  const list = [process.env.NEXT_PUBLIC_APP_URL, ...(process.env.ALLOWED_ORIGINS || "").split(",")]
    .map((s) => s?.trim())
    .filter(Boolean) as string[];
  if (process.env.NODE_ENV !== "production") list.push("http://localhost:3000", "http://127.0.0.1:3000");
  return list;
}
