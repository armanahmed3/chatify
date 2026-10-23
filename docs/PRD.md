# Product Requirements Document (PRD) — Chatify AI Chatbot Platform

**Version:** 1.0.0-PROD  
**Author:** Senior Full-Stack Engineer & Product Architect  
**Status:** Approved & Living Document  

---

## 1. Executive Summary & Problem Statement

Small local businesses (auto repair shops, dental and medical clinics, hair & beauty salons, restaurants, law firms, and boutique retail shops) lose up to 40% of inbound potential customer inquiries. Calls and messages arrive after hours, while technicians are servicing vehicles, while doctors are seeing patients, or while staff are busy.

Existing AI chatbot builders (such as Chatbase, CustomGPT, and Botsonic) suffer from critical limitations:
1. **Meter Fear & Extortionate Pricing**: Per-message pricing, surprise token overages, and expensive add-on packs scare budget-conscious business owners.
2. **Technical Complexity**: Forcing users to supply their own OpenAI API keys or navigate dense LLM prompt parameters results in 60%+ abandonment during onboarding.
3. **Hallucination & Fabricated Answers**: Existing platforms frequently hallucinate prices, schedules, or services when retrieval context is weak.
4. **Channel Fragmentation**: Chatbots are confined to web widgets or require expensive, convoluted third-party middleware (e.g. Zapier/Make) to link WhatsApp, Instagram, or Facebook Messenger.
5. **Lack of Actionability**: Chatbots can chat, but cannot book appointments, qualify leads, issue dynamic coupons, or trigger external CRM webhooks natively.

**Chatify** is the next-generation, multi-tenant AI Chatbot Platform engineered specifically for non-technical small business owners. It allows business owners to train a tailored AI chatbot in under 5 minutes from their website, social media, files, or Q&As, and deploy it across Website, WhatsApp, Instagram, and Messenger with flat, transparent pricing.

---

## 2. Target Users & Personas

| Persona | Business Type | Core Pain Point | Primary Goal |
|---|---|---|---|
| **Dr. Sarah Khan** | Dental & Medical Clinic | Receptionist misses evening phone inquiries and weekend booking requests. | Capture emergency dental leads 24/7, triage appointment requests, answer insurance FAQs without hallucinating. |
| **Mike Henderson** | Auto Repair & Garage | Hands are oily all day; cannot answer the phone while servicing transmissions. | Provide accurate service pricing ranges, capture vehicle make/model/VIN, and schedule inspection slots. |
| **Elena Gomez** | Boutique Salon & Spa | Customers message on Instagram and WhatsApp asking for stylist rates and available weekend times. | Direct booking via Calendly/Google Calendar, recommend treatments, and answer parking/location queries. |
| **David Vance** | Local Restaurant & Catering | Busy dinner rush makes answering catering inquiries or dietary questions impossible. | Instant menu lookup, dietary allergen answers, group reservation capture, and event inquiries. |

---

## 3. Competitor Gaps We Beat

| Feature | Chatbase | CustomGPT | Botsonic | **Chatify** |
|---|---|---|---|---|
| **Pricing Model** | Strict monthly message caps with expensive tiers | High entry price ($99+) | Usage credits that drain fast | **Flat monthly price, ZERO per-message fees, unlimited FAQ answers** |
| **API Key Requirement** | Optional BYOK, confusing quota terms | Enterprise setup | Complex API credit setup | **100% Zero-Key required for users; central Lifetime-Free router** |
| **Answers-Before-AI** | No (Every query hits LLM) | No | Limited | **Yes: Exact Q&A Match -> Semantic Cache (0.92) -> Free RAG** |
| **Omnichannel Unified** | Web only (paid integrations) | Web only | Limited | **Web (<30KB widget) + WhatsApp + Instagram + Messenger in ONE Inbox** |
| **AI Actions** | Limited webhooks | Search only | Limited | **Native appointment booking, custom webhooks, dynamic coupon engine** |
| **Small Business Templates**| Generic blank bots | Enterprise datasets | Generic prompts | **8 Turnkey Industry Templates with pre-loaded Q&As and intent prompts** |
| **Over-Quota Behavior** | Bot stops cold or errors | Bot dies | Billing error | **Graceful lead capture fallback + friendly pause + owner upgrade alert** |

---

## 4. User Stories

- **US-01 (Instant Onboarding):** As a non-technical salon owner, I want to paste my website link and have my chatbot live within 5 minutes without ever seeing or entering an API key.
- **US-02 (Zero Hallucination):** As a clinic manager, I want the bot to fallback politely and capture the user's phone number whenever it lacks verified context, rather than inventing clinical advice or medical rates.
- **US-03 (Omnichannel Reach):** As a garage owner, I want customer inquiries from my website, WhatsApp Business number, and Facebook page to land in one unified dashboard inbox.
- **US-04 (Lead Capture & Alerts):** As a real estate broker, I want hot leads scored automatically and sent to my email with phone number and inquiry details immediately.
- **US-05 (Predictable Cost):** As a small retailer, I want to pay a single flat monthly fee knowing I will never be hit with unexpected usage invoices.

---

## 5. Functional Requirements (By Milestone)

### Milestone 1: Foundation + Landing + DB
- Next.js 14 App Router, TypeScript strict, Tailwind CSS, shadcn/ui.
- Supabase Postgres schema with Row Level Security (RLS) on all tables, `pgvector` extension with HNSW cosine index.
- High-converting landing page matching `DESIGN-SYSTEM.md`: Hero, 5-minute interactive onboarding preview, feature grid, flat pricing table with ROI comparison, FAQ accordion, conversion CTAs.
- Authentication pages (Login, Signup, Forgot Password, Reset Password).

### Milestone 2: Auth + Workspaces + Dashboard
- Supabase Auth (Email magic link / password + Google OAuth).
- Auto-provisioning of personal workspace and profile upon signup.
- Multi-tenant workspace switcher and settings (branding, logo, accent color, currency, avg job value).
- Team member invitations with role-based access control (Owner, Admin, Agent, Viewer).
- 5-step interactive onboarding checklist.

### Milestone 3: Chatbot Builder + Multi-Source Ingest Engine
- Bot CRUD (Create, Read, Update, Delete, Duplicate, Active/Pause) with unguessable public UUIDs.
- Configuration tabs: General, Personality & Tone, Appearance (with real-time live preview), Language settings.
- Shared ingest pipeline `ingest(text, metadata)`:
  - Text normalization & semantic chunking (~1000 tokens with 200 token overlap).
  - High-performance vector embeddings.
  - Multi-source connectors:
    1. Website Crawler (sitemap-aware, robots.txt-compliant, clean markdown extraction).
    2. Custom Text / Policy documents.
    3. Structured Q&A Pairs (CSV bulk import, flagged `priority=high`).
    4. Document Upload (PDF, DOCX, TXT, CSV, XLSX up to 10MB).
    5. Social profiles (Facebook page, Instagram bio/posts text extraction with fallback).
    6. YouTube video transcript extractor.
    7. Notion / Google Drive link placeholders.

### Milestone 4: Central AI Engine + Test Chat
- Central AI Router `/lib/ai/router.ts`:
  - Tier 1: Google Gemini Flash (AI Studio free tier).
  - Tier 2: Groq LLaMA 3.1 8B Instant (Ultra-low latency free tier).
  - Tier 3: Groq LLaMA 3.3 70B / OSS (High intelligence free tier).
  - Tier 4: Cloudflare Workers AI Llama 3.3 70B (Daily free neurons).
  - Tier 5: OpenRouter free models.
  - Tier 6: Paid fallback (Gemini Flash-Lite, gated by `PAID_FALLBACK_ENABLED=false`).
  - Automatic silent failover on 429 rate limit, timeout (5s), or 5xx server errors.
- Cost-Killer "Answers-Before-AI" RAG Engine `/lib/ai/rag.ts`:
  1. Exact Q&A lookup (<10ms, $0 cost).
  2. Upstash Redis Semantic Cache (cosine similarity >= 0.92, $0 cost).
  3. pgvector cosine similarity search (top 4 chunks max).
  4. Rolling conversational memory (last 4 messages + summary).
  5. Confidence scoring & automatic fallback trigger.
- Streaming API `/api/chat/[public_id]` with token budgeting and citations.
- Real-time sentiment & intent classifier (Sales, Support, Booking, Complaint, Angry customer alert).
- In-dashboard live test-chat inspector showing latency, matched chunks, provider, and confidence.

### Milestone 5: Public Chat + Widget + Unified Inbox + Leads
- Public standalone chat interface `/chat/[public_id]` (responsive, accessible, voice input via Web Speech API, text-to-speech read-aloud).
- Embeddable widget script `/public/widget.js`:
  - Vanilla JS, zero dependencies, <30KB minified.
  - Floating trigger button, badge, customizable launcher icon, iframe isolation.
  - Strict domain whitelist verification to prevent unauthorized embedding.
- Embed guide page with 1-click code snippets (HTML Script, Iframe, WordPress, Shopify).
- Unified Inbox:
  - Real-time chat list with status filter (All, Open, Bot, Human Handover, Resolved).
  - Human Takeover (silences bot immediately) and Return-to-Bot toggles.
  - Internal agent private notes and tags.
- Smart Lead Capture Engine:
  - Triggers on intent keywords, after N user turns, or manual CTA.
  - Captures name, email, phone, and requirements.
  - Automatic lead qualification (Hot, Warm, Cold).
  - Real-time email notification to workspace owner via Resend on Hot leads.
  - Export leads to CSV.

### Milestone 6: Billing + Analytics + ROI
- Stripe integration (Checkout, Customer Portal, Webhook sync).
- Flat subscription tiers enforced via `/lib/plans.ts`:
  - **Free**: $0/mo, 1 bot, unlimited FAQ answers, 100 AI chats/mo, branded badge.
  - **Starter**: $29/mo, 2 bots, unlimited FAQs, 2,000 AI chats/mo, lead capture, badge removed.
  - **Pro**: $79/mo, 5 bots, unlimited FAQs, 10,000 AI chats/mo, WhatsApp/IG/FB, AI Actions.
  - **Agency**: $199/mo, 25 bots, unlimited FAQs, 50,000 AI chats/mo, white-label, client sub-accounts.
- Quota enforcement: on limit reached, bot shows friendly pause message and lead form.
- Usage dashboard showing AI Chats vs. Unlimited FAQ Answers (no token metrics).
- Analytics reporting: total conversations, resolution rate, top user questions, peak hours.
- Unanswered Questions Inbox: grouped questions with 1-click "Add as Q&A" instant training.
- ROI Calculator Widget: hours saved, estimated revenue pipeline generated.

### Milestone 7: AI Actions + Meta Channels + Industry Templates + Workflows
- Native AI Actions:
  - Appointment Booking (Google Calendar / Calendly link).
  - Custom REST Webhook with secret masking and dry-run tester.
  - Instant Email Summary dispatcher.
  - Dynamic Promotional Coupon generator.
  - Product Catalog Cards rendered in chat from uploaded CSV/XLSX.
- Meta Official Channels:
  - WhatsApp Cloud API Webhook.
  - Facebook Messenger & Instagram DM Webhooks.
  - In-app Meta Developer step-by-step setup guide with webhook verification.
- 8 Pre-built Turnkey Industry Templates:
  - Restaurant, Dental Clinic, Real Estate, Auto Repair/Garage, Beauty Salon, E-commerce, Law Firm, Fitness Gym.
- Custom Workflow Rule Builder (IF keyword/intent/hours THEN action).
- Bot Export/Import as portable JSON packages.

### Milestone 8: Agency White-Label + Super Admin + Production Hardening
- Agency White-Labeling: custom CNAME domain verification, custom logo, custom favicon, hidden platform branding.
- Super Admin Portal (`/admin`): global platform stats, workspace suspension, provider health monitor, system audit logs.
- GDPR Compliance: 1-click full workspace data & vector export, permanent deletion cascade.
- Security & Reliability: rate-limiting via Upstash, strict CORS headers, input sanitization, safe markdown rendering, graceful degradation when all AI providers are unavailable.

---

## 6. Non-Functional Requirements

- **Performance**: P95 widget load time < 250ms. P95 time-to-first-token on streaming chat < 800ms. FAQ / Cache hit latency < 80ms.
- **Security**: 100% database queries gated by Supabase RLS. No plain-text external secrets in client bundles. Zero XSS in markdown rendering.
- **Scalability**: Stateless Next.js App Router deployable to Vercel or Cloudflare Pages with edge-ready API routes.
- **Availability**: High availability via 5-tier AI failover router and graceful fallback to offline lead capture.
- **Accessibility**: WCAG 2.1 AA compliant contrast ratios, full keyboard navigation, screen reader ARIA landmarks, RTL support for languages such as Urdu and Arabic.
