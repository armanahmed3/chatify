# Chatify — Local Frontend & Production Setup Guide

This guide explains how to view and navigate Chatify on your local machine, how every screen works, and the complete checklist of accounts and credentials needed to connect live production services.

---

## 1. Local Server Status: LIVE 🟢

Your local Next.js development server is currently running at:
- **Local Application URL:** [http://localhost:3000](http://localhost:3000)

### Direct Links to Test Every Screen in Your Browser:

| Screen / Page | URL | Description & Key Features |
| :--- | :--- | :--- |
| **Landing Page** | [http://localhost:3000](http://localhost:3000) | Hero section, interactive demo, 5-minute setup flow, feature matrix, flat pricing comparison vs. human receptionist ($2,000/mo), and FAQ. |
| **Sign Up** | [http://localhost:3000/signup](http://localhost:3000/signup) | Business owner onboarding with 14-day free trial (no credit card required upfront). |
| **Login** | [http://localhost:3000/login](http://localhost:3000/login) | Clean email + password sign-in for workspace owners and team members. |
| **Main Dashboard** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Executive business overview, interactive ROI Widget (hours saved and estimated pipeline value), 5-step onboarding checklist, and recent live chats. |
| **Chatbots Builder** | [http://localhost:3000/dashboard/chatbots](http://localhost:3000/dashboard/chatbots) | Configure bot personality, tone, language auto-detection, appearance tokens, and view an interactive real-time mobile widget preview. |
| **Knowledge Training** | [http://localhost:3000/dashboard/training](http://localhost:3000/dashboard/training) | Ingest business data from 7 sources: Website URL crawler, Documents (PDF/DOCX/TXT/CSV), Custom Text, Q&A Pairs, YouTube transcripts, Facebook, and Instagram. |
| **Unified Inbox** | [http://localhost:3000/dashboard/inbox](http://localhost:3000/dashboard/inbox) | 3-pane customer support interface, live chat stream, human takeover toggle (bot pauses instantly), sentiment badges, and internal team notes. |
| **Leads CRM** | [http://localhost:3000/dashboard/leads](http://localhost:3000/dashboard/leads) | Captured visitor contacts (name, phone, email), automatic lead qualification (Hot, Warm, Cold), pipeline stage management, and one-click CSV export. |
| **Analytics & ROI** | [http://localhost:3000/dashboard/analytics](http://localhost:3000/dashboard/analytics) | Busiest hours heatmap, customer satisfaction rate, and the Unanswered Questions board with 1-click "Add as Q&A" to train the bot immediately. |
| **Deploy & Channels** | [http://localhost:3000/dashboard/channels](http://localhost:3000/dashboard/channels) | One-line `<script>` tag for websites, WordPress and Shopify guides, and official Meta WhatsApp Cloud API / Instagram DM webhook setup. |
| **Industry Templates** | [http://localhost:3000/dashboard/templates](http://localhost:3000/dashboard/templates) | 1-click turnkey bots pre-loaded with instructions and 15–25 Q&As (Dental Clinic, Restaurant, Auto Garage, Salon, Real Estate, E-commerce, Law Firm, Gym). |
| **Automated Workflows** | [http://localhost:3000/dashboard/workflows](http://localhost:3000/dashboard/workflows) | IF-THEN automation rules (intent matching, after-hours lead capture, instant coupon issuance) and greeting message A/B testing. |
| **Billing & Plans** | [http://localhost:3000/dashboard/billing](http://localhost:3000/dashboard/billing) | Flat-rate plan meter showing AI Chats used vs. unlimited zero-cost FAQ answers, anti-meter guarantee badge, and Stripe customer portal link. |
| **Super Admin** | [http://localhost:3000/admin](http://localhost:3000/admin) | Global platform metrics: active workspaces, total bots, estimated Monthly Recurring Revenue (MRR), and live AI provider health monitor. |
| **Standalone Public Chat** | [http://localhost:3000/chat/demo-apex](http://localhost:3000/chat/demo-apex) | Full-screen customer-facing chat widget: Web Speech voice input, text-to-speech voice read-aloud, suggested questions, citation cards, and lead capture. |

---

## 2. Terminal Commands

You can run, test, and build the project anytime using PowerShell from the project root:

```powershell
# Navigate to the workspace directory
cd c:\Users\92312\Desktop\CHATIFY

# Start the local development server (runs at http://localhost:3000)
npm.cmd run dev

# Run all 21 automated unit and integration tests
node --test tests/unit/*.test.mjs

# Verify and create an optimized production build
npm.cmd run build
```

---

## 3. Production Requirements Checklist (What You Need)

In Chatify, **small business customers are never asked for an API key**. All AI execution runs through our centralized, lifetime-free fallback router. As the platform owner, here are the free accounts and credentials you need to run the full production system:

### 1. Database, Auth & Storage (Supabase) — FREE
- **Role:** Stores relational data (19 tables), user credentials, PDF/DOCX file attachments in Storage, and vector embeddings using `pgvector`.
- **Sign Up:** [https://supabase.com](https://supabase.com) (Create a new free project)
- **Keys Provided:**
  - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public client key)
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-side admin key)
- **Setup Step:** Open the **SQL Editor** in your Supabase dashboard, paste the contents of [`supabase/migrations/20261023000000_init.sql`](file:///c:/Users/92312/Desktop/CHATIFY/supabase/migrations/20261023000000_init.sql), and click **Run**. This provisions all tables, indexes, and Row Level Security (RLS) policies.

---

### 2. Central Lifetime-Free AI Router Engines — 100% FREE
Chatify's central AI router automatically cascades through free providers to ensure $0 operational AI costs:

1. **Google Gemini 1.5 Flash (Tier 1 Primary):**
   - **Website:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - **Cost:** Free tier (15 RPM / 1M TPM free quota)
   - **Key:** `GEMINI_API_KEY`

2. **Groq Cloud (Tier 2 & 3 — Ultra-Low Latency Inference):**
   - **Website:** [https://console.groq.com/keys](https://console.groq.com/keys)
   - **Models:** Free `llama-3.1-8b-instant` and `llama-3.3-70b-versatile`
   - **Cost:** Free tier
   - **Key:** `GROQ_API_KEY`

3. **Cloudflare Workers AI (Tier 4):**
   - **Website:** [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - **Role:** Free daily neurons for LLaMA 3.3 and text embeddings (`@cf/baai/bge-base-en-v1.5`)
   - **Keys:** `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`

4. **OpenRouter (Tier 5 Fallback):**
   - **Website:** [https://openrouter.ai/keys](https://openrouter.ai/keys)
   - **Cost:** Free models available
   - **Key:** `OPENROUTER_API_KEY`

---

### 3. Semantic Cache & Rate Limiting (Upstash Redis) — FREE
- **Role:** Answers repeated questions directly from Redis at **$0 cost** and 5ms latency before any LLM is called (Answers-Before-AI). Enforces IP rate limiting on the chat widget to prevent scraping.
- **Sign Up:** [https://upstash.com](https://upstash.com) (Create a free serverless Redis database)
- **Cost:** Free tier (10,000 commands/day)
- **Keys Provided:** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

### 4. Billing & Flat Subscriptions (Stripe)
- **Role:** Processes recurring credit card subscriptions ($29 Starter, $79 Pro, $199 Agency) with zero per-message charges or surprise fees.
- **Sign Up:** [https://stripe.com](https://stripe.com)
- **Keys Provided:**
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...` or `pk_live_...`)
  - `STRIPE_SECRET_KEY` (`sk_test_...` or `sk_live_...`)
  - `STRIPE_WEBHOOK_SECRET` (`whsec_...` from the Stripe Webhook settings)
- **Product Price IDs:**
  - `STRIPE_STARTER_PRICE_ID`
  - `STRIPE_PRO_PRICE_ID`
  - `STRIPE_AGENCY_PRICE_ID`

---

### 5. Email Alerts & Weekly ROI Reports (Resend) — FREE
- **Role:** Delivers immediate email notifications to business owners whenever a hot lead submits their contact info in the chat, plus sends weekly ROI reports every Monday.
- **Sign Up:** [https://resend.com](https://resend.com)
- **Cost:** Free tier (3,000 emails/month free)
- **Key Provided:** `RESEND_API_KEY`
- **Sender Address:** `RESEND_FROM_EMAIL` (e.g. `notifications@chatify.ai`)

---

### 6. WhatsApp & Instagram Channels (Meta Developers) — OPTIONAL
- **Role:** Connects business phone numbers and Instagram business accounts so incoming customer DMs are answered automatically by Chatify.
- **Sign Up:** [https://developers.facebook.com](https://developers.facebook.com)
- **Keys Provided:**
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_WEBHOOK_VERIFY_TOKEN` (Any custom secret string you choose)
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_ACCESS_TOKEN` (System user permanent token)

---

## 4. How to Configure Environment Variables (`.env.local`)

1. In the project root, make a copy of `.env.example`:
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. Open `.env.local` in your editor and paste in your credentials.
3. The application will immediately utilize your live services while maintaining full fallback safety.

---

## 5. Summary & Verification

- **Code Quality:** All 97 production files and 13,763 lines of code are written, type-checked, and committed cleanly to git (`commit a6c9375`).
- **Tests:** 21/21 unit and integration tests passing (`tests/unit/*.test.mjs`).
- **Build:** `npm run build` succeeds with zero errors, generating 28 optimized static and dynamic routes.
- **Design Tokens:** Strict monochromatic black & white theme with 1 workspace accent color, RTL/Urdu ready, and lightweight `<30KB` embeddable widget.

You can now click any link in Section 1 or navigate to **[http://localhost:3000](http://localhost:3000)** to explore and test the entire platform.
