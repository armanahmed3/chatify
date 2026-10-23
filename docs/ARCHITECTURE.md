# System Architecture Specification — Chatify AI Chatbot Platform

**Version:** 1.0.0-PROD  
**Status:** Approved Architectural Baseline  

---

## 1. System Overview & Architecture Diagram

```
                              [ End Users / Customers ]
                                /         |         \
                               /          |          \
                 [ Website Widget ]  [ WhatsApp ]  [ Instagram / FB ]
                 (<30KB Vanilla JS)  (Cloud API)   (Messenger API)
                               \          |          /
                                \         |         /
                                 v        v        v
                   ===============================================
                     CHATIFY INGRESS & SECURITY GATEWAY (Next.js)
                     - Domain Whitelist Verification
                     - Upstash Redis Rate Limiting (IP & Workspace)
                     - Zod Input Validation & Sanitization
                   ===============================================
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
      [ Public Chat API ]                                [ Dashboard API ]
      /api/chat/[public_id]                              /api/workspaces, /api/bots, etc.
                |                                                   |
                v                                                   |
      ==============================                                |
        ANSWERS-BEFORE-AI ENGINE                                    |
        1. Exact Q&A Match (<10ms)                                  |
        2. Upstash Redis Semantic Cache                             |
           (Cosine Sim >= 0.92)                                     |
      ==============================                                |
                |                                                   |
      [ Cache Miss ]                                                |
                |                                                   |
                v                                                   |
      ==============================                                |
        VECTOR RETRIEVAL (RAG)                                      |
        Supabase pgvector (HNSW)                                    |
        Top 4 Chunks + System Prompt                                |
      ==============================                                |
                |                                                   |
                v                                                   |
      ==============================                                |
        CENTRAL AI ROUTER (Failover)                                |
        Tier 1: Google Gemini Flash                                 |
        Tier 2: Groq LLaMA 3.1 8B                                   |
        Tier 3: Groq LLaMA 3.3 70B                                  |
        Tier 4: Cloudflare Workers AI                               |
        Tier 5: OpenRouter Free Models                              |
        Tier 6: Optional Paid Fallback                              |
      ==============================                                |
                |                                                   |
                +-------------------------+-------------------------+
                                          |
                                          v
                   ===============================================
                        SUPABASE CLOUD / POSTGRES STORAGE
                        - Row Level Security (RLS) Enforced
                        - Multi-Tenant Workspaces (workspace_id)
                        - Vector Embeddings (768-dim HNSW)
                        - Storage Buckets (docs, logos, exports)
                   ===============================================
```

---

## 2. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    PROFILES ||--o{ WORKSPACE_MEMBERS : belongs_to
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : has
    WORKSPACES ||--o{ CHATBOTS : owns
    WORKSPACES ||--o{ SUBSCRIPTIONS : billed_via
    WORKSPACES ||--o{ USAGE_LOGS : records
    WORKSPACES ||--o{ AUDIT_LOGS : audits
    WORKSPACES ||--o{ API_KEYS : authorizes
    WORKSPACES ||--o{ WORKFLOW_RULES : configures

    CHATBOTS ||--o{ WIDGET_SETTINGS : configures
    CHATBOTS ||--o{ TRAINING_SOURCES : ingests
    CHATBOTS ||--o{ CONVERSATIONS : conducts
    CHATBOTS ||--o{ LEADS : captures
    CHATBOTS ||--o{ ACTIONS : executes
    
    TRAINING_SOURCES ||--o{ DOCUMENT_CHUNKS : splits_into
    CONVERSATIONS ||--o{ MESSAGES : contains
    ACTIONS ||--o{ ACTION_RUNS : logs
    
    WORKSPACES {
        uuid id PK
        text name
        text slug
        text logo_url
        text accent_color
        text currency
        numeric avg_job_value
        text custom_domain
        boolean custom_domain_verified
        boolean white_label_enabled
        boolean is_suspended
        timestamptz created_at
    }

    WORKSPACE_MEMBERS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        text role
        timestamptz created_at
    }

    CHATBOTS {
        uuid id PK
        uuid workspace_id FK
        uuid public_id
        text name
        text description
        text personality
        text tone
        numeric temperature
        text instructions
        text fallback_message
        text primary_language
        boolean is_active
        timestamptz created_at
    }

    TRAINING_SOURCES {
        uuid id PK
        uuid workspace_id FK
        uuid chatbot_id FK
        text source_type
        text title
        text url
        text status
        integer total_characters
        timestamptz last_synced_at
        timestamptz auto_sync_interval
    }

    DOCUMENT_CHUNKS {
        uuid id PK
        uuid workspace_id FK
        uuid chatbot_id FK
        uuid source_id FK
        text content
        vector embedding
        text priority
        jsonb metadata
        timestamptz created_at
    }

    CONVERSATIONS {
        uuid id PK
        uuid workspace_id FK
        uuid chatbot_id FK
        text channel
        text session_id
        text status
        text user_ip
        timestamptz created_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        text sender_type
        text content
        jsonb citations
        numeric confidence_score
        text sentiment
        text intent
        text feedback
        timestamptz created_at
    }

    LEADS {
        uuid id PK
        uuid workspace_id FK
        uuid chatbot_id FK
        uuid conversation_id FK
        text name
        text email
        text phone
        text requirements
        text qualification_status
        text score
        timestamptz created_at
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid workspace_id FK
        text stripe_customer_id
        text stripe_subscription_id
        text plan_tier
        text status
        timestamptz current_period_end
    }

    USAGE_LOGS {
        uuid id PK
        uuid workspace_id FK
        uuid chatbot_id FK
        text query_type
        text provider_used
        integer input_tokens
        integer output_tokens
        boolean was_llm_call
        timestamptz created_at
    }
```

---

## 3. Comprehensive API Specification

| Endpoint | Method | Auth | Payload / Params | Response | Description |
|---|---|---|---|---|---|
| `/api/chat/[public_id]` | `POST` | Public / Rate-limited | `{ message: string, conversation_id?: string, session_id: string }` | Stream (SSE) / JSON `{ content, citations, confidence, is_lead_triggered }` | Public chat endpoint powering web widget and mobile chat |
| `/api/chat/[public_id]/feedback` | `POST` | Public | `{ message_id: string, feedback: 'up'\|'down', note?: string }` | `{ ok: true }` | Records end-user thumbs-up/down feedback |
| `/api/chat/[public_id]/voice` | `POST` | Public | FormData (audio blob) | `{ text: string }` | Server fallback audio transcription (Groq Whisper) |
| `/api/chat/[public_id]/lead` | `POST` | Public | `{ name, email, phone, requirements, conversation_id }` | `{ ok: true, lead_id: string }` | Widget inline lead submission |
| `/api/workspaces` | `GET` | Session (JWT) | None | `{ workspaces: Workspace[] }` | List workspaces user belongs to |
| `/api/workspaces` | `POST` | Session (JWT) | `{ name: string, accent_color?: string }` | `{ workspace: Workspace }` | Creates a new tenant workspace |
| `/api/workspaces/[id]/settings` | `PATCH` | Owner / Admin | `{ name, logo_url, accent_color, avg_job_value, custom_domain }` | `{ workspace: Workspace }` | Updates branding and configuration |
| `/api/bots` | `GET` | Member | `?workspace_id=uuid` | `{ bots: Chatbot[] }` | Fetch chatbots in workspace |
| `/api/bots` | `POST` | Owner / Admin | `{ name, personality, tone, instructions, appearance }` | `{ bot: Chatbot }` | Creates a new chatbot |
| `/api/bots/[id]` | `PATCH` | Owner / Admin | Bot fields update | `{ bot: Chatbot }` | Updates bot configuration |
| `/api/bots/[id]/duplicate` | `POST` | Owner / Admin | None | `{ bot: Chatbot }` | Clones a bot with its widget configuration |
| `/api/training/crawl` | `POST` | Owner / Admin | `{ chatbot_id, url: string, max_pages?: number }` | `{ source_id, pages_queued: number }` | Ingests website with sitemap crawler |
| `/api/training/text` | `POST` | Owner / Admin | `{ chatbot_id, title: string, content: string }` | `{ source_id, chunks_created: number }` | Ingests raw text or policies |
| `/api/training/qa` | `POST` | Owner / Admin | `{ chatbot_id, pairs: [{question, answer}] }` | `{ count: number }` | Bulk imports high-priority Q&A pairs |
| `/api/training/upload` | `POST` | Owner / Admin | FormData (file: PDF/DOCX/TXT/CSV) | `{ source_id, filename: string }` | Parses file and ingests chunks |
| `/api/training/social` | `POST` | Owner / Admin | `{ chatbot_id, platform: 'fb'\|'ig', url: string }` | `{ source_id, extracted: boolean }` | Ingests social page text |
| `/api/training/youtube` | `POST` | Owner / Admin | `{ chatbot_id, video_url: string }` | `{ source_id, title: string }` | Extracts YouTube captions & ingests |
| `/api/inbox/conversations` | `GET` | Member | `?status=open&channel=all&search=...` | `{ conversations: Conversation[] }` | Unified inbox conversation list |
| `/api/inbox/takeover` | `POST` | Agent / Admin | `{ conversation_id: string, action: 'take'\|'release' }` | `{ ok: true, status: string }` | Toggles human agent takeover |
| `/api/leads` | `GET` | Member | `?workspace_id=uuid` | `{ leads: Lead[] }` | Fetches captured leads with scoring |
| `/api/billing/checkout` | `POST` | Owner | `{ plan: 'starter'\|'pro'\|'agency', cycle: 'monthly' }` | `{ checkout_url: string }` | Initiates Stripe Checkout session |
| `/api/billing/portal` | `POST` | Owner | None | `{ portal_url: string }` | Opens Stripe Customer Portal |
| `/api/billing/webhook` | `POST` | Stripe Signature | Raw Stripe Event | `{ received: true }` | Processes Stripe subscription events |
| `/api/channels/meta/webhook` | `GET` | Meta Challenge | `hub.verify_token`, `hub.challenge` | Raw Challenge String | Webhook handshake for WhatsApp/Messenger/IG |
| `/api/channels/meta/webhook` | `POST` | Meta Signature | Meta Inbound Message Payload | `{ status: 'ok' }` | Ingests WhatsApp/FB/IG messages into chat router |
| `/api/admin/metrics` | `GET` | Super Admin | None | Global MRR, active bots, provider health | Platform-wide monitoring |

---

## 4. AI Router & Failover Flow Diagram

```mermaid
flowchart TD
    A[Incoming User Query] --> B{Exact Q&A Match?}
    B -- Yes --> C[Return Exact Match: $0 Cost, <10ms]
    B -- No --> D{Semantic Cache Hit >= 0.92?}
    D -- Yes --> E[Return Cached Answer: $0 Cost, <20ms]
    D -- No --> F[Vector Similarity Search: pgvector HNSW]
    F --> G[Extract Top 4 Context Chunks]
    G --> H{Context Score >= Confidence Threshold?}
    H -- No --> I[Return Fallback Message + Display Lead Capture Form]
    H -- Yes --> J[Attempt Tier 1: Google Gemini Flash]
    J -- Success --> K[Stream Response + Save Citations + Sentiment]
    J -- 429 / Timeout / 5xx --> L[Attempt Tier 2: Groq LLaMA 3.1 8B Instant]
    L -- Success --> K
    L -- 429 / Timeout / 5xx --> M[Attempt Tier 3: Groq LLaMA 3.3 70B OSS]
    M -- Success --> K
    M -- 429 / Timeout / 5xx --> N[Attempt Tier 4: Cloudflare Workers AI]
    N -- Success --> K
    N -- 429 / Timeout / 5xx --> O[Attempt Tier 5: OpenRouter Free Tier]
    O -- Success --> K
    O -- Fail & PAID_FALLBACK_ENABLED --> P[Attempt Tier 6: Gemini Flash-Lite]
    P -- Success --> K
    O -- Fail & !PAID_FALLBACK_ENABLED --> Q[Graceful Degradation: Offline Lead Capture Mode]
```

---

## 5. Threat Model & Multi-Tenant Security Isolation

### 1. Row Level Security (RLS) Isolation
Every table within Postgres enforces Row Level Security.
- Direct table selects require that the authenticated Supabase user (`auth.uid()`) has an active membership record in `workspace_members` matching the queried row's `workspace_id`.
- Tenant cross-leakage is blocked at the database engine level, rendering accidental SQL query omissions completely inert.

### 2. Widget Domain Whitelisting & Origin Guard
- Every chatbot possesses an optional `allowed_domains` array (e.g. `['mysalon.com', 'booking.mysalon.com']`).
- When a web browser requests `/api/chat/[public_id]`, the server validates the HTTP `Origin` and `Referer` headers against the whitelist.
- If an origin does not match, the API rejects the request with HTTP 403, preventing competitors or bad actors from leeching a business's AI chatbot.

### 3. Rate Limiting & Abuse Prevention
- Rate limits are enforced on all public and authenticated endpoints via Upstash Redis sliding window token buckets:
  - Public Chat: 30 requests / minute per IP; 120 requests / minute per Bot.
  - Ingest & Crawl: 5 crawl jobs / hour per Workspace.
  - Lead Submission: 5 submissions / minute per IP.

### 4. Injection & Safe Markdown Rendering
- Prompt Injection Defense: System prompt incorporates boundary tags (`<context>` ... `</context>`) and explicit instruction fences forbidding user instructions from overriding system persona or business knowledge.
- Client-Side XSS Protection: The chat UI renders bot markdown responses using sanitized HTML parsers stripping `<script>`, `<iframe>`, `onload`, and javascript-href vectors.
