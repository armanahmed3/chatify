# Assumptions & Technical Decisions

This document records architectural, product, and implementation decisions chosen for simplicity, security, and production readiness without halting the build.

1. **AI Provider Fallback Order**: Central AI Router defaults to Free Tier order: Google Gemini Flash (AI Studio) -> Groq llama-3.1-8b-instant -> Groq gpt-oss-120b -> Cloudflare Workers AI Llama 3.3 70B -> OpenRouter free tier -> (Optional) Gemini Flash-Lite paid fallback.
2. **Embedding Model**: Default embeddings use Cloudflare `@cf/baai/bge-base-en-v1.5` (768 dimensions) or Google Gemini `text-embedding-004` (768 dimensions) to match pgvector `vector(768)` HNSW index.
3. **Multi-Tenant Data Isolation**: Every table contains a `workspace_id` UUID column with foreign key to `workspaces(id)` and strict Postgres Row Level Security (RLS) policies enforcing `auth.uid() IN (SELECT user_id FROM workspace_members WHERE workspace_id = ...)`.
4. **Non-Technical User Experience**: No user is ever asked for an AI provider API key during onboarding, training, or dashboard usage. All AI inference is proxied centrally by the platform.
5. **Answers-Before-AI Strategy**: Exact Q&A matches and Redis semantic cache matches (cosine similarity >= 0.92) return in <50ms with 0 LLM token cost and do NOT consume customer monthly AI chat quotas.
6. **Billing Model**: Flat monthly tiers with no per-message fees and no automatic overages. If a plan limit is reached, the chatbot gracefully shows a lead capture form with a friendly pause message and alerts the workspace owner to upgrade.
7. **Embeddable Widget**: Built as pure Vanilla JavaScript (<30KB minified/gzipped), zero external runtime dependencies, sandboxed styling using CSS isolation or Shadow DOM iframe to prevent CSS bleeding on customer sites (WordPress, Shopify, Webflow, custom HTML).
8. **Meta Channels (WhatsApp, Messenger, Instagram)**: Webhook endpoints conform strictly to Meta Graph API v20.0+ specifications with verify tokens, HMAC-SHA256 signature verification, and background queuing.
