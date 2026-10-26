# Product Context: Chatify

## Overview
Chatify is a zero-code, lifetime-free routing AI chatbot and lead conversion platform built specifically for non-technical small and local business owners (auto repair shops, dental practices, salons, retail stores, real estate agencies, and home services).

## Target Users & Core Jobs
- **Primary Users:** Non-technical small business owners, practice managers, front-desk receptionists, and marketing agencies managing clients.
- **Jobs To Be Done:**
  1. Capture high-value customer inquiries 24/7 when staff are busy or closed.
  2. Answer pricing, hours, insurance, and service questions strictly from verified business documents without hallucinations.
  3. Seamlessly hand off conversations to human operators via 1-click takeover.
  4. Integrate across Web, WhatsApp, Instagram DM, and Messenger into a unified inbox with real-time visitor alerts.
  5. Automate appointment bookings and lead scoring (Hot, Warm, Cold).

## Differentiating Mechanism
- **Answers-Before-AI Architecture:** Direct exact Q&A pairs and high-confidence semantic cache respond in <20ms at $0 API cost before hitting LLM inference.
- **Flat Predictable Pricing:** No per-message overage billing or surprise token invoices. Generous tier caps with graceful degradation (offline lead capture mode rather than hard bot shutdowns).
- **Anti-Hallucination Guard:** Bot strictly acknowledges missing facts and captures caller phone/email rather than inventing clinical advice, pricing, or hours.

## Platform & Technical Architecture
- **Platform:** Web Application (Next.js 14 App Router, TypeScript, React 18).
- **Design Tokens:** Tailwind CSS 3.4 with standardized HSL semantic variables and Impeccable craft guidelines.
- **Database & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS) and JWT verification.
- **AI Routing Engine:** Resilient multi-provider routing (Gemini 1.5 Flash, Groq Llama 3.3, Cloudflare Workers AI) with zero mandatory client-side API keys.

## Brand Voice & Principles
- **Direct & Helpful:** Business owners do not care about vector embeddings; they care about missed appointments and monthly revenue.
- **Clarity Over Jargon:** Use simple terminology ("Instant Answer" instead of "Cache Hit", "Knowledge Document" instead of "RAG Vector Chunk").
- **Trust & Integrity:** Customer leads and phone numbers are encrypted and isolated per workspace with comprehensive audit trails.
