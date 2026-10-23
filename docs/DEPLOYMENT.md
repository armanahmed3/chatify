# Deployment & Release Engineering Guide — Chatify Platform

**Version:** 1.0.0-PROD  
**Target Environments:** Vercel / Cloudflare Pages + Supabase Cloud + Upstash Redis  

---

## 1. Prerequisites & Infrastructure Setup

Before deploying to production, provision the following managed cloud services:
1. **Supabase Project**: Postgres with `pgvector` enabled.
2. **Upstash Redis**: Serverless Redis instance for semantic caching and rate limiting.
3. **Stripe Account**: Standard account with products created for Starter, Pro, and Agency tiers.
4. **Resend Account**: Verified sender domain for instant hot lead alerts and weekly ROI reports.
5. **Meta Developer App**: Approved App for WhatsApp Cloud API, Instagram Graph API, and Messenger.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development, or configure these directly in your Vercel / Cloudflare Environment Variables dashboard:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI Provider Keys (Lifetime-Free AI Router)
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
OPENROUTER_API_KEY=sk-or-...
PAID_FALLBACK_ENABLED=false

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# Stripe Billing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com

# Meta Official APIs
META_APP_ID=...
META_APP_SECRET=...
META_WEBHOOK_VERIFY_TOKEN=your_secure_random_token
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 3. Database Migration Execution (Supabase)

1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run the migration script in:
   `supabase/migrations/20261023000000_init.sql`
3. Verify that the extensions are active:
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp', 'pgcrypto');
   ```
4. Verify Row Level Security is active:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

---

## 4. Production Deployment to Vercel

1. Push your repository to GitHub / GitLab:
   ```bash
   git add .
   git commit -m "feat: complete production-ready Chatify platform"
   git push origin main
   ```
2. Import the project in [Vercel](https://vercel.com/new).
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.
5. Enter all Environment Variables from Section 2.
6. Click **Deploy**. Vercel will run `npm run build` and provision Edge and Serverless functions.

---

## 5. Cron Job Setup (Scheduled Tasks)

Add a `vercel.json` or configure external cron triggers (e.g. GitHub Actions or CronHook):

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/sync-websites",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

- **Weekly Report**: Runs every Monday at 9:00 AM, compiles inquiries, hours saved, and leads generated, and sends an email via Resend to the workspace owner.
- **Sync Websites**: Automatically crawls websites with auto-sync enabled to refresh vector knowledge bases.

---

## 6. Rollback & Disaster Recovery Plan

If a faulty release is detected in production:
1. **Instant Vercel Rollback**: Navigate to Vercel Deployments -> Click previous passing deployment -> Click **Promote to Production**. (Downtime: <5 seconds).
2. **Database Rollback**: Migrations are backward-compatible. In the event of schema rollback, restore from Supabase Point-in-Time Recovery (PITR) backup.
