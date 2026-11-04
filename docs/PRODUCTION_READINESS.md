# Production Readiness — Chatify

This maps every item of the production checklist to where it is implemented, plus the steps that must be done
outside the code (in Supabase / your host / provider dashboards).

## 1. Go-live steps (do these in order)

1. **Rotate every API key that was ever pasted into chat, a ticket, or a commit** (Supabase service role,
   Gemini, Groq, Upstash, Resend). Treat them as compromised.
2. **Apply the database migrations** (Supabase dashboard → SQL editor, run each file in order, or `supabase db push`):
   `supabase/migrations/20261023000000_init.sql` → `20261024000001_hardening_indexes.sql` →
   `20261025000002_security_hardening.sql` → `20261104000003_production_lockdown.sql`.
3. **Set production env vars** in your host (never in git). Use `.env.example` as the list. Required:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.
   The server refuses to start in production if these are missing (`instrumentation.ts`).
4. **Resend:** verify your sending domain and set `RESEND_FROM_EMAIL` to an address on it. Signup sends the
   email OTP; in production signup fails closed if the email cannot be delivered.
5. **Supabase Auth settings:** enable leaked-password protection, set minimum password length ≥ 10, set the
   Site URL + redirect URL (`https://your-domain/api/auth/callback`), and enable Google OAuth if used.
6. **Make yourself super admin** (SQL editor):
   `update public.profiles set is_super_admin = true where email = 'you@yourdomain.com';`
7. Deploy (see §3), then hit `https://your-domain/api/health`.

## 2. Security checklist → implementation

| Item | Where / how |
| --- | --- |
| Lock down login | `app/api/auth/login/route.ts`: per-IP **and** per-account throttling (5 / 15 min), generic errors (no account enumeration), dev sandbox accounts disabled in production |
| Check access on every request | `lib/supabase/middleware.ts`: every `/api/*` route except the explicit public list requires a Supabase session; `/dashboard` & `/admin` redirect to login |
| Enforce permissions server side | `lib/auth/guard.ts` (`verifyWorkspaceAccess`, `verifyBotOwnership`, `verifySuperAdmin`) with owner/admin/agent/viewer hierarchy; billing requires `owner` |
| Fix broken object level authorization | Workspace/bot ownership checks on bots, training (chatbot must belong to workspace), billing, GDPR; widget endpoints resolve bot by `public_id` and only touch conversations matching bot **and** session (`lib/chat/public-bot.ts`) |
| Enable row level security | RLS forced on all tables; `20261104000003_production_lockdown.sql` adds role-based policies, removes anonymous INSERT policies, stops leaking bot system prompts to the anon key, blocks self-promotion to super admin, hides `mfa_secret` |
| Multi-factor authentication | Real RFC 6238 TOTP (`lib/security/totp.ts`); half-authenticated sessions are signed out until the code is valid; login UI prompts for the code |
| Hash passwords securely | Supabase Auth (bcrypt) in production; dev sandbox uses scrypt + random salt + constant-time compare |
| Secure JWT secrets / remove auth tokens from localStorage | Supabase JWTs only live in httpOnly cookies via `@supabase/ssr`; localStorage only holds non-secret UI state |
| Keep API secrets server side / hide APIs | Only `NEXT_PUBLIC_*` reach the browser; service-role client is server-only; AI keys are only read in server code (`lib/ai/*`). Verified: no secret values appear in `.next/static` |
| Change default credentials | Hardcoded demo passwords removed; sandbox passwords come from env or are random per boot; Meta verify-token default removed |
| Rate limit everything | Global per-IP limit on every API call in middleware + stricter tiers: login, signup, chat widget, per-bot ceiling, lead/feedback submit, training/crawl, webhooks (`lib/security/ratelimit.ts`, Upstash Redis, in-memory fallback) |
| Validate all input | zod schemas with length/format caps on every route; malformed JSON → 400 |
| SQL injection | All DB access via Supabase query builder (parameterized PostgREST); no string-built SQL |
| Block XSS | Strict CSP (`object-src 'none'`, `base-uri 'self'`, `frame-ancestors`), React auto-escaping, HTML-escaping of visitor data in emails (`lib/security/escape.ts`), SVG uploads banned |
| CSRF protection | Origin/Referer allow-list for all cookie-authenticated mutations (`lib/supabase/middleware.ts`), `SameSite=Lax` cookies |
| Validate file upload | `lib/security/upload.ts`: size cap, MIME + extension allow-list, magic bytes (PDF/PNG/JPEG/WEBP/DOCX), text files rejected if binary or contain `<script>`, path-traversal-safe filenames |
| Verify webhook signatures | Stripe (`constructEvent`, unsigned rejected outside dev), Meta HMAC-SHA256 constant-time (mandatory in production), outbound action webhooks are HMAC-signed |
| Check for SSRF | `lib/security/ssrf.ts`: blocks private/reserved IPv4+IPv6, resolves DNS and rejects private answers, re-validates every redirect hop (`safeFetch`); crawl requires auth |
| Tighten CORS | No CORS on private APIs; wildcard CORS only on credential-less widget endpoints |
| Remove exposed source maps | `productionBrowserSourceMaps: false`; CI fails if any `.map` is in `.next/static` |
| Keep sensitive data out of logs | `lib/logger.ts` redacts secrets/JWTs/OTPs/cookies and masks emails/phones; errors returned to clients are generic (`lib/http.ts`) |
| Update vulnerable dependencies | Next 14 → **15.5.29** (fixes critical RCE advisories), React 19, zod 4, resend 6, @supabase/ssr 0.12; `npm audit --omit=dev` = 0 vulnerabilities |
| Harden for production | Security headers (HSTS, CSP, XFO, COOP, nosniff), `poweredByHeader: false`, `no-store` on APIs, non-root read-only container, `.dockerignore` keeps `.env*` out of images |

## 3. Deployment, scaling & architecture

```
Browser / customer site ──▶ CDN (Vercel Edge / Cloudflare) ──▶ Next.js 15 (stateless, N replicas)
                                   │                                 │
                     static assets cached immutable        Supabase Postgres + pgvector (RLS)
                                                           Upstash Redis (rate limits, OTPs, semantic cache)
                                                           Gemini / Groq / Cloudflare AI (tiered router)
                                                           Resend (email), Stripe (billing), Meta (WhatsApp)
```

- **Cloud hosting:** Vercel (zero-config) or any container host (Fly.io, Render, ECS, Cloud Run) using the
  `Dockerfile` (`output: "standalone"`, Node 22, non-root, healthcheck).
- **Scaling:** the app is stateless. Rate limits, OTPs and the semantic cache live in Upstash Redis, so you can run
  any number of replicas (`docker-compose.yml` runs 2). Postgres scales with Supabase compute + connection pooler.
- **Caching / CDN:** `/_next/static` is `immutable` for 1 year; `widget.js` CDN-cached for 1 day with SWR; private
  APIs `no-store`; LLM answers semantically cached in Redis (`lib/ai/cache.ts`).
- **Database indexing:** composite indexes on every tenant query path + HNSW vector index
  (`20261024000001_hardening_indexes.sql`, `20261104000003_production_lockdown.sql`).
- **CI/CD:** `.github/workflows/ci.yml` runs secret scanning (gitleaks), typecheck, `npm audit`, unit/security tests,
  production build, source-map check, then a Docker build. Connect the repo to Vercel/your host for CD on `main`.

## 4. Monitoring, logging, error tracking, notifications

- **Logging:** structured JSON logs with redaction (`lib/logger.ts`); audit trail in `audit_logs`.
- **Error tracking:** `instrumentation.ts` `onRequestError` captures every server error. To add Sentry:
  `npx @sentry/wizard@latest -i nextjs` and call `Sentry.captureRequestError` there.
- **Monitoring:** point an uptime monitor (Better Stack, UptimeRobot, Checkly) at `/api/health`.
- **Notifications:** Resend hot-lead alerts to `OWNER_ALERT_EMAIL`; signup OTP email.

## 5. Load testing

```bash
npm run build && npm start                    # terminal 1
npm run test:load                             # terminal 2 (Node script)
k6 run tests/load/k6-script.js                # or k6, if installed
```
Expect `429` responses once rate limits are reached — that is the limiter working.

## 6. Known follow-ups (not blocking, but recommended)

- Phone verification is off in production until an SMS provider (e.g. Twilio Verify) is wired in; set
  `SMS_VERIFICATION_ENABLED=true` after.
- The anti-trial-abuse ledger and live-visitor tracking are in-memory per instance; move them to Redis/Postgres
  for multi-replica accuracy.
- An MFA enrolment UI (generate secret → QR via `totpUri()` → confirm code → set `mfa_enabled`) still needs building;
  until then enable MFA per user via SQL.
- CSP uses `'unsafe-inline'` for scripts (required by Next.js without nonces); moving to nonce-based CSP is the
  next hardening step.
