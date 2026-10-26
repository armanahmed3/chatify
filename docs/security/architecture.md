# Security Architecture & Boundary Mapping: Chatify

## 1. System Overview
Chatify is a multi-tenant AI conversational platform for small businesses that indexes business knowledge and answers customer questions over Web widgets, WhatsApp Cloud API, Instagram DM, and Facebook Messenger.

```
+-----------------------------------------------------------------------------------+
|                              UNTRUSTED EXTERNAL CLIENTS                            |
|  - Anonymous Web Visitors (Widget, Public Chat)                                   |
|  - Authenticated Business Operators & Admins                                       |
|  - Webhook Delivery (Meta WhatsApp / Stripe / Calendly)                           |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ HTTPS / Edge WAF
+-----------------------------------------------------------------------------------+
|                              NEXT.JS APP ROUTER GATEWAY                           |
|  - CSRF Origin Guard (`lib/security/csrf.ts`)                                     |
|  - Sliding-Window Rate Limiting (`lib/security/ratelimit.ts`)                     |
|  - Input Validation & Parameter Sanitization                                      |
+-----------------------------------------------------------------------------------+
        │                                 │                              │
        ▼ Auth & Session                  ▼ Ingestion & Webhooks         ▼ AI Inference
+-----------------------+     +--------------------------+    +----------------------+
|  Supabase Auth & RLS  |     |  SSRF & Magic-Byte Guard |    |  AI Router & Cache   |
|  - JWT Verification   |     |  - SSRF Filter (IP/Host) |    |  - Prompt Injection  |
|  - Tenant Isolation   |     |  - Magic Byte MIME Check |    |  - Semantic Cache    |
|  - Anti-Trial Abuse   |     |  - HMAC Signature Verif  |    |  - Zero-Hallucinate  |
+-----------------------+     +--------------------------+    +----------------------+
```

## 2. Trust Boundaries & Attack Surfaces

### Boundary 1: Anonymous Public Chat & Widget Ingestion
- **Entry Points:** `POST /api/chat/[public_id]`, `POST /api/chat/[public_id]/lead`.
- **Threats:** Denial of Service, Prompt Injection, System Prompt extraction, Database resource exhaustion, Fake lead spam.
- **Controls Enforced:**
  1. *Answers-Before-AI Semantic Cache:* Exact FAQ pairs and cached embeddings answer before touching LLM.
  2. *Anti-Injection System Prompt Isolation:* User inputs are strictly wrapped in delimiter boundaries with explicit instruction overriding bans.
  3. *Rate Limiting:* 30 requests / 60 seconds sliding window per IP address.
  4. *Input Length Capping:* Max 1,000 characters per message.

### Boundary 2: Crawler Ingestion & File Uploads (SSRF & RCE)
- **Entry Points:** `POST /api/training/crawl`, `POST /api/training/upload`.
- **Threats:** Server-Side Request Forgery (SSRF) hitting cloud metadata (`169.254.169.254`), internal loopback (`127.0.0.1`), LAN subnets; Malicious file upload / polyglot execution.
- **Controls Enforced:**
  1. *SSRF Validator (`lib/security/ssrf.ts`):* Resolves hostnames, validates DNS, rejects IPv4/IPv6 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`), AWS/GCP/Azure instance metadata, and non-HTTP(S) schemes.
  2. *File Upload Validator (`lib/security/file-validation.ts`):* Verifies magic bytes (`%PDF-`, `PK\x03\x04`), enforces 10MB limits, strips path traversals.

### Boundary 3: Webhook Verification (Integrity & Non-Repudiation)
- **Entry Points:** `POST /api/webhooks/whatsapp`, `POST /api/webhooks/stripe`.
- **Threats:** Forged customer messages, fake payment events, replay attacks.
- **Controls Enforced:**
  1. *HMAC Cryptographic Verification (`lib/security/webhook-verify.ts`):* Verifies `X-Hub-Signature-256` and `Stripe-Signature` using `crypto.timingSafeEqual` against secret keys.

### Boundary 4: Multi-Tenant Data Isolation (Supabase RLS)
- **Storage:** PostgreSQL with Supabase Row Level Security enabled across `workspaces`, `workspace_members`, `chatbots`, `knowledge_documents`, `leads`, `conversations`.
- **Threats:** Insecure Direct Object References (IDOR), cross-tenant data leakage.
- **Controls Enforced:**
  1. *RLS Policies:* Every select, insert, update, and delete checks `auth.uid()` membership in `workspace_members`.
  2. *Schema Hardening:* `security definer` functions set explicit `search_path = public, pg_temp`.

### Boundary 5: Anti-Trial Abuse Engine
- **Threats:** Sybil attackers creating bulk burner accounts to exploit free trial quotas.
- **Controls Enforced:**
  1. *Verification Pipeline (`lib/security/trial-abuse.ts`):* Filters disposable domains (Mailinator, TempMail), limits 1 trial per verified phone number, fingerprint checks.
