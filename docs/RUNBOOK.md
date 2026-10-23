# Chatify Production Runbook

This runbook outlines operational procedures, incident response playbooks, health checks, and troubleshooting steps for the Chatify multi-tenant AI Chatbot platform.

---

## 1. System Architecture & Component Overview

| Component | Provider / Tech | Role | Criticality |
| :--- | :--- | :--- | :--- |
| **Frontend & API** | Next.js 14 on Vercel / Cloudflare | App Router, SSR, Edge Routes, Streaming Chat | HIGH |
| **Primary Database** | Supabase Postgres 15+ | Multi-tenant relational data, RLS, pgvector HNSW | CRITICAL |
| **Auth & Storage** | Supabase Auth & Storage | User session JWTs, PDF/DOCX file attachments | HIGH |
| **AI Fallback Tier** | Gemini Flash $\to$ Groq $\to$ Cloudflare $\to$ OpenRouter | Multi-tiered LLM routing & embedding generation | CRITICAL |
| **Semantic Cache** | Upstash Redis | Cosine similarity cache ($\ge 0.92$), rate limiting | MEDIUM |
| **Billing Engine** | Stripe | Webhook subscriptions, Customer Portal | HIGH |
| **Transactional Email** | Resend | Hot-lead alerts, weekly ROI reports | MEDIUM |
| **Widget Engine** | Vanilla JS (`/public/widget.js`) | Sandboxed iframe embedded on client websites | CRITICAL |

---

## 2. Emergency Incident Playbooks

### Incident Playbook A: All AI Providers Are Down (Global LLM Outage)

#### Symptoms
- Customers report chat widget displays: *"I'm taking note of your inquiry..."*
- `/api/admin` shows provider health status `down` for Gemini, Groq, and Cloudflare.
- Sentry / logs show consecutive 429/500/503 errors across router tiers.

#### Automatic Fail-Safe Behavior
Chatify has a built-in zero-data-loss fallback mechanism:
1. Exact and Q&A matches ($0 cost) continue to respond instantly with 100% accuracy.
2. If no exact answer exists, the bot **does not hallucinate or crash**.
3. It politely renders the lead capture form:
   > *"I'm currently assisting multiple visitors, but please leave your name, phone, or email and our team will get right back to you!"*
4. Inbound visitor details are captured into the `leads` table and instant alerts fire to the business owner via Resend.

#### Operator Action Steps
1. Verify provider status dashboards:
   - Google AI Studio: [status.cloud.google.com](https://status.cloud.google.com/)
   - Groq Cloud: [groqstatus.com](https://groqstatus.com/)
   - Cloudflare Workers AI: [cloudflarestatus.com](https://www.cloudflarestatus.com/)
2. If temporary rate-limiting (429):
   - Check if an API key reached its quota.
   - Rotate `GEMINI_API_KEY` or `GROQ_API_KEY` in Vercel project environment variables.
3. If an individual provider has a scheduled maintenance or degradation:
   - The router automatically skips failed tiers with 0ms interruption.
   - Optional: Temporarily enable `PAID_FALLBACK_ENABLED="true"` to route traffic through Gemini Flash-Lite paid tier if configured.
4. Redeploy or restart edge instances via Vercel dashboard:
   ```bash
   vercel redeploy --prod
   ```

---

### Incident Playbook B: Supabase Database Storage / Connection Exhaustion

#### Symptoms
- API queries return `500 Internal Server Error` with `remaining connection slots are reserved for non-replication superuser connections` or `disk full`.
- Dashboard requests fail to load conversation histories.

#### Operator Action Steps
1. **Enable Connection Pooling (PgBouncer / Supabase Supavisor):**
   - Ensure `DATABASE_URL` connects through transaction pooler port `6543` rather than direct session port `5432`.
   - Update Vercel environment variable `DATABASE_URL` to the pooled URI.
2. **Disk Storage Remediation:**
   - Run the vacuum & chunk prune command in Supabase SQL editor:
     ```sql
     VACUUM ANALYZE document_chunks;
     VACUUM ANALYZE messages;
     ```
   - Check for orphaned training chunks from deleted sources:
     ```sql
     DELETE FROM document_chunks 
     WHERE source_id NOT IN (SELECT id FROM training_sources);
     ```
   - If database reached 8GB/50GB plan tier, scale compute or storage disk in Supabase project dashboard $\to$ **Database** $\to$ **Compute & Disk**.

---

### Incident Playbook C: Stripe Webhook Delivery Failures

#### Symptoms
- Users upgrade on the Pricing page, but their workspace remains on the Free tier.
- Stripe Dashboard $\to$ **Developers** $\to$ **Webhooks** shows non-200 responses for `customer.subscription.created` or `customer.subscription.updated`.

#### Operator Action Steps
1. Check Stripe Webhook logs in Stripe Dashboard for exact failure code.
2. If signature verification failed:
   - Confirm `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the signing secret in Stripe Dashboard (`whsec_...`).
3. Replay failed events:
   - In Stripe Dashboard $\to$ **Webhooks** $\to$ Select endpoint $\to$ Click **Failed events** $\to$ Click **Resend**.
4. Manual Workspace Sync via Admin:
   - If urgent, update workspace plan directly in Supabase or `/admin`:
     ```sql
     UPDATE workspaces 
     SET plan = 'pro', updated_at = NOW() 
     WHERE stripe_customer_id = 'cus_xxx';
     ```

---

### Incident Playbook D: Malicious Scraping / Widget Flooding Attack

#### Symptoms
- Abnormal spike in chat requests from a single IP or domain.
- Free tier AI chat quota depleting rapidly.

#### Automatic Protection
- Upstash Redis enforces 30 requests/minute per client IP on `/api/chat/[public_id]`.
- Cross-origin embeds are restricted by domain whitelist settings configured in `widget_settings.allowed_domains`.

#### Operator Action Steps
1. Identify offending IP or origin domain from `usage_logs`.
2. Add malicious IP to Cloudflare WAF / Vercel Firewall rules to drop traffic at the edge.
3. For specific affected chatbots:
   - Go to `/dashboard/chatbots` $\to$ Toggle chatbot status from `Active` to `Paused`.
   - The embed will immediately cease responding to queries without requiring website code removal.

---

### Incident Playbook E: WhatsApp / Instagram Meta Webhook Disconnect

#### Symptoms
- Visitors message business WhatsApp number or Instagram account, but no responses are generated and no messages appear in the Unified Inbox.

#### Operator Action Steps
1. Check Meta Developer Portal:
   - Visit [developers.facebook.com](https://developers.facebook.com/) $\to$ Select Chatify App $\to$ **Webhooks**.
   - Verify Webhook URL is `https://yourdomain.com/api/channels/meta/webhook`.
   - Verify Verify Token matches `META_WEBHOOK_VERIFY_TOKEN`.
2. Verify Page Access Token expiration:
   - System user tokens should be created with `never_expires` setting.
   - If token expired, generate a new System User access token in Meta Business Suite and update `META_ACCESS_TOKEN` in project env vars.
3. Test webhook handshake:
   - Click **Test** button next to `messages` subscription in Meta Webhooks dashboard.

---

## 3. Routine Maintenance & Automated Crons

### Weekly Business ROI Digest
- **Frequency:** Every Monday at 08:00 UTC.
- **Trigger:** Cron runner (`/api/cron/weekly-roi`) or external scheduler (e.g., cron-job.org / GitHub Actions).
- **Function:** Aggregates chats resolved, hours saved, and estimated pipeline value ($300 $\times$ leads captured) and emails the business owner via Resend.

### Website Knowledge Auto-Resync
- **Frequency:** Every Sunday at 02:00 UTC.
- **Function:** Crawls registered website URLs for Starter, Pro, and Agency plans to detect newly published menu items, updated pricing, or changed operating hours.

---

## 4. Disaster Recovery & Backups

| Tier | Backup Type | Retention | RPO | RTO |
| :--- | :--- | :--- | :--- | :--- |
| Supabase Postgres | Automated daily WAL + snapshots | 7–30 days | < 5 minutes | < 1 hour |
| Supabase Storage | Multi-region redundant S3 backend | Continuous | 0 | < 15 minutes |
| Vector Embeddings | Re-generatable from raw `training_sources` | N/A | < 1 hour | Auto re-sync |

---

## 5. Escalation Contacts & On-Call Matrix

- **Engineering Lead:** Senior Full-Stack Engineer (`ops@chatify.ai`)
- **Infrastructure:** Supabase Support Portal & Vercel Priority Support
- **Payment Operations:** Stripe Concierge
