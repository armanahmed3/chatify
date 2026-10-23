# Chatify — Login Credentials & Required API URLs Guide

This guide provides everything you need to log in to Chatify locally, test every screen, and obtain all the free API keys and service URLs required to run the platform in production.

---

## 1. Local Login Credentials

Your local development server is currently running at **[http://localhost:3000](http://localhost:3000)**.

To sign in and access the business dashboard, you have two options:

### Option A: 1-Click Instant Demo Login (Recommended)
1. Open **[http://localhost:3000/login](http://localhost:3000/login)** in your browser.
2. Click the highlighted button:
   > **`⚡ Quick 1-Click Demo Login (Instant Dashboard)`**
3. You will immediately enter the dashboard without typing anything.

### Option B: Manual Sign-In Credentials
* **Login URL:** [http://localhost:3000/login](http://localhost:3000/login)
* **Email:** `demo@chatify.ai` *(or any work email like `owner@yourbusiness.com`)*
* **Password:** `password123` *(or any 8+ character password)*

> **Direct URL Access:** In local development mode, you can also navigate directly to any dashboard page (e.g. [http://localhost:3000/dashboard](http://localhost:3000/dashboard) or [http://localhost:3000/dashboard/chatbots](http://localhost:3000/dashboard/chatbots)) without any login roadblock.

---

## 2. Directory of Required Services & Exact URLs

Chatify is built with a **central lifetime-free AI router**. Your end-customers never need an API key. Below is the complete list of free accounts, their exact signup URLs, and where to retrieve each credential:

---

### Service 1: Supabase (Database, Auth, Storage & Vectors)
* **What it does:** Hosts the Postgres database (all 19 tables), handles user sessions, stores document uploads (PDF/DOCX), and executes vector similarity searches (`pgvector`).
* **Cost:** 100% Free tier (up to 500MB database, 1GB file storage, 50,000 monthly active users).
* **Exact URL to Sign Up & Get Keys:**
  👉 **[https://supabase.com/dashboard](https://supabase.com/dashboard)**
* **Steps to Get Your Keys:**
  1. Click **"New Project"**, name it `chatify-db`, and set a database password.
  2. Once the project initializes, click **Project Settings** (gear icon on the left) $\to$ **API**.
  3. Copy the following three values:
     * **Project URL** $\to$ maps to `NEXT_PUBLIC_SUPABASE_URL`
     * **anon / public key** $\to$ maps to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     * **service_role key** (click "Reveal") $\to$ maps to `SUPABASE_SERVICE_ROLE_KEY`
  4. Go to the **SQL Editor** on the left menu, open the file [`supabase/migrations/20261023000000_init.sql`](file:///c:/Users/92312/Desktop/CHATIFY/supabase/migrations/20261023000000_init.sql), paste its full contents, and click **Run**.

---

### Service 2: Google AI Studio (Gemini 1.5 Flash — Primary AI Engine)
* **What it does:** Primary LLM for answering visitor inquiries with citations, personality, and tone adjustments.
* **Cost:** 100% Free (15 requests per minute, 1,000,000 tokens per minute free).
* **Exact URL to Get Your Key:**
  👉 **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
* **Steps to Get Your Key:**
  1. Sign in with any Google account.
  2. Click **"Create API key"**.
  3. Select your Google Cloud project (or let it auto-create one).
  4. Copy the generated key $\to$ maps to `GEMINI_API_KEY`.

---

### Service 3: Groq Cloud (LLaMA 3.1 & 70B — Ultra-Fast Fallback AI)
* **What it does:** Secondary AI tier providing sub-second inference if Gemini is busy or rate-limited.
* **Cost:** 100% Free tier.
* **Exact URL to Get Your Key:**
  👉 **[https://console.groq.com/keys](https://console.groq.com/keys)**
* **Steps to Get Your Key:**
  1. Sign up with Google or GitHub.
  2. In the left sidebar, click **API Keys**.
  3. Click **"Create API Key"**, give it a name like `chatify-router`, and click **Submit**.
  4. Copy the key (starts with `gsk_...`) $\to$ maps to `GROQ_API_KEY`.

---

### Service 4: Cloudflare Workers AI (Tertiary AI & Text Embeddings)
* **What it does:** Generates 768-dimensional vector embeddings for crawled web pages and documents (`@cf/baai/bge-base-en-v1.5`), plus serves LLaMA 3.3.
* **Cost:** 100% Free (10,000 free neural units per day).
* **Exact URL to Get Your Keys:**
  👉 **[https://dash.cloudflare.com](https://dash.cloudflare.com)**
* **Steps to Get Your Keys:**
  1. Log in to Cloudflare.
  2. In the right sidebar of your dashboard, copy your **Account ID** $\to$ maps to `CLOUDFLARE_ACCOUNT_ID`.
  3. Go to **My Profile** (top right) $\to$ **API Tokens** $\to$ **Create Token**.
  4. Choose the template **"Workers AI (Read & Write)"** and create the token.
  5. Copy the generated token $\to$ maps to `CLOUDFLARE_API_TOKEN`.

---

### Service 5: Upstash Redis (Semantic FAQ Cache & Anti-Scraping Rate Limiter)
* **What it does:** Checks if an inquiry matches a previously answered question ($\ge 0.92$ similarity). If matched, it answers in 5ms at **$0 cost** without calling any AI model. Also limits website widget calls to 30 requests/minute per IP.
* **Cost:** 100% Free tier (10,000 commands per day).
* **Exact URL to Get Your Keys:**
  👉 **[https://console.upstash.com](https://console.upstash.com)**
* **Steps to Get Your Keys:**
  1. Click **"Create Database"**, choose **Regional**, and select your nearest region.
  2. Scroll down to the **"REST API"** section.
  3. Click the **`.env`** tab.
  4. Copy the two values:
     * `UPSTASH_REDIS_REST_URL`
     * `UPSTASH_REDIS_REST_TOKEN`

---

### Service 6: Stripe (Flat-Subscription Billing)
* **What it does:** Collects flat monthly payments ($29 Starter, $79 Pro, $199 Agency) without per-message charges or surprise overages.
* **Cost:** Free in Test Mode (no credit card required for development).
* **Exact URL to Get Your Keys:**
  👉 **[https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)**
* **Steps to Get Your Keys:**
  1. Toggle the dashboard to **"Test Mode"** (top right switch).
  2. Copy:
     * **Publishable key** (`pk_test_...`) $\to$ maps to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     * **Secret key** (`sk_test_...`) $\to$ maps to `STRIPE_SECRET_KEY`
  3. Go to **Developers** $\to$ **Webhooks** $\to$ **Add endpoint**:
     * URL: `https://yourdomain.com/api/billing/webhook` (or your local ngrok URL during testing)
     * Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
     * Copy the **Signing secret** (`whsec_...`) $\to$ maps to `STRIPE_WEBHOOK_SECRET`

---

### Service 7: Resend (Lead Notifications & Weekly ROI Reports)
* **What it does:** Automatically sends instant email alerts to business owners when a visitor submits their phone number or email (Hot Lead), and emails a weekly ROI summary every Monday.
* **Cost:** 100% Free tier (3,000 emails/month free).
* **Exact URL to Get Your Key:**
  👉 **[https://resend.com/api-keys](https://resend.com/api-keys)**
* **Steps to Get Your Key:**
  1. Sign in with GitHub or your email.
  2. In the left menu, click **API Keys**.
  3. Click **"Create API Key"**, set permissions to "Full access", and copy the key (starts with `re_...`) $\to$ maps to `RESEND_API_KEY`.
  4. Set `RESEND_FROM_EMAIL="onboarding@resend.dev"` (or verify your custom business domain).

---

### Service 8: Meta Developer Platform (WhatsApp & Instagram Channels — Optional)
* **What it does:** Enables the chatbot to answer inbound customer messages on an official WhatsApp Business phone number and Instagram Direct Messages.
* **Cost:** Free for test phone numbers and sandboxes.
* **Exact URL to Get Started:**
  👉 **[https://developers.facebook.com/apps](https://developers.facebook.com/apps)**
* **Steps to Get Your Keys:**
  1. Click **"Create App"**, select **"Other"**, and choose **"Business"**.
  2. Add the **WhatsApp** product.
  3. Copy your **Phone Number ID** $\to$ maps to `WHATSAPP_PHONE_NUMBER_ID`.
  4. Under **API Setup**, copy the temporary access token (or generate a System User permanent token) $\to$ maps to `WHATSAPP_ACCESS_TOKEN`.
  5. Set your Webhook URL to: `https://yourdomain.com/api/channels/meta/webhook` with verify token `chatify_meta_verify_secret_token`.

---

## 3. Quick Copy `.env.local` Template

To activate all your keys at once:

1. Create a file named `.env.local` inside `c:\Users\92312\Desktop\CHATIFY\`:
```powershell
Copy-Item .env.example .env.local
```
2. Paste your keys into `.env.local`:

```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Free AI Router
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxx
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-v1-...
PAID_FALLBACK_ENABLED=false

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx...

# Stripe Billing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_starter
STRIPE_PRO_PRICE_ID=price_pro
STRIPE_AGENCY_PRICE_ID=price_agency

# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WIDGET_URL=http://localhost:3000/widget.js
```

---

## 4. Verification Check

Once you have added your keys:
1. Run the automated test suite to verify all router and fallback configurations:
   ```powershell
   node --test tests/unit/*.test.mjs
   ```
2. The dev server will automatically reload with your live credentials active.
