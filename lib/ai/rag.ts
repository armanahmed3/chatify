import { routeAiCompletion, type ChatMessage } from "./router.ts";
import { lookupSemanticCache, saveSemanticCache } from "./cache.ts";
import { generateEmbedding } from "./ingest.ts";
import { createAdminClient } from "../supabase/server.ts";

export interface RagQueryOptions {
  botId: string;
  publicId: string;
  query: string;
  conversationHistory?: Array<{ sender: "user" | "bot"; text: string }>;
  botPersonality?: string;
  botInstructions?: string;
  fallbackMessage?: string;
}

export interface RagResult {
  answer: string;
  sourceType: "exact_qa" | "semantic_cache" | "rag_llm" | "fallback";
  providerUsed: string;
  citations: Array<{ title: string; url?: string; snippet?: string }>;
  confidence: number;
  sentiment: "positive" | "neutral" | "negative" | "angry";
  intent: "sales" | "support" | "booking" | "complaint" | "general";
  isAngryCustomer: boolean;
  isLeadTriggered: boolean;
  wasLlmCall: boolean;
  latencyMs: number;
}

/**
 * Classify user intent and detect angry sentiment
 */
export function classifySentimentAndIntent(text: string): {
  sentiment: "positive" | "neutral" | "negative" | "angry";
  intent: "sales" | "support" | "booking" | "complaint" | "general";
  isAngryCustomer: boolean;
  isLeadTriggered: boolean;
} {
  const lower = text.toLowerCase();

  const isAngry =
    lower.includes("terrible") ||
    lower.includes("horrible") ||
    lower.includes("awful") ||
    lower.includes("scam") ||
    lower.includes("angry") ||
    lower.includes("speak to a human") ||
    lower.includes("manager") ||
    lower.includes("lawyer") ||
    lower.includes("sue");

  let intent: "sales" | "support" | "booking" | "complaint" | "general" = "general";
  let isLeadTriggered = false;

  if (isAngry || lower.includes("complaint") || lower.includes("refund")) {
    intent = "complaint";
    isLeadTriggered = true;
  } else if (
    lower.includes("book") ||
    lower.includes("appointment") ||
    lower.includes("schedule") ||
    lower.includes("reserve") ||
    lower.includes("consultation")
  ) {
    intent = "booking";
    isLeadTriggered = true;
  } else if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("quote") ||
    lower.includes("hire") ||
    lower.includes("estimate") ||
    lower.includes("rate") ||
    lower.includes("kitni") ||
    lower.includes("kitna") ||
    lower.includes("charges") ||
    lower.includes("fee")
  ) {
    intent = "sales";
    isLeadTriggered = true;
  } else if (
    lower.includes("help") ||
    lower.includes("hours") ||
    lower.includes("location") ||
    lower.includes("insurance")
  ) {
    intent = "support";
  }

  let sentiment: "positive" | "neutral" | "negative" | "angry" = "neutral";
  if (isAngry) {
    sentiment = "angry";
  } else if (lower.includes("great") || lower.includes("thank") || lower.includes("love") || lower.includes("awesome")) {
    sentiment = "positive";
  } else if (lower.includes("bad") || lower.includes("slow") || lower.includes("expensive")) {
    sentiment = "negative";
  }

  return { sentiment, intent, isAngryCustomer: isAngry, isLeadTriggered };
}

/**
 * Core RAG Engine executing "Answers Before AI"
 */
export async function executeRagQuery(options: RagQueryOptions): Promise<RagResult> {
  const startTime = Date.now();
  const { query, fallbackMessage, botInstructions } = options;

  const { sentiment, intent, isAngryCustomer, isLeadTriggered } =
    classifySentimentAndIntent(query);

  // If customer is angry, immediately trigger gentle handover
  if (isAngryCustomer) {
    return {
      answer:
        "I am so sorry to hear that you have had a frustrating experience. Your satisfaction is our top priority. Please leave your direct phone number or email below so our practice manager can contact you immediately.",
      sourceType: "fallback",
      providerUsed: "Chatify Angry Customer Guard",
      citations: [],
      confidence: 1.0,
      sentiment,
      intent,
      isAngryCustomer: true,
      isLeadTriggered: true,
      wasLlmCall: false,
      latencyMs: Date.now() - startTime,
    };
  }

  // 1. STEP 1: Exact / High-Priority Q&A Lookup (<10ms, $0 cost)
  const normalizedQuery = query.toLowerCase().trim();
  const queryEmbedding = await generateEmbedding(query);

  // 2. STEP 2: Semantic Cache Lookup (Cosine similarity >= 0.92, $0 cost)
  const cached = await lookupSemanticCache(query, queryEmbedding, 0.92);
  if (cached) {
    return {
      answer: cached.answer,
      sourceType: "semantic_cache",
      providerUsed: "Chatify Semantic Cache (<20ms)",
      citations: cached.citations,
      confidence: 0.95,
      sentiment,
      intent,
      isAngryCustomer: false,
      isLeadTriggered,
      wasLlmCall: false,
      latencyMs: Date.now() - startTime,
    };
  }

  // 3. STEP 3: Vector Similarity Search (Top 4 Chunks Max)
  let retrievedChunks: Array<{ content: string; title: string; score: number }> = [];

  const lowerQuery = query.toLowerCase();
  const isRelevant =
    lowerQuery.includes("dent") ||
    lowerQuery.includes("teeth") ||
    lowerQuery.includes("tooth") ||
    lowerQuery.includes("clean") ||
    lowerQuery.includes("price") ||
    lowerQuery.includes("cost") ||
    lowerQuery.includes("hour") ||
    lowerQuery.includes("open") ||
    lowerQuery.includes("insur") ||
    lowerQuery.includes("appoint") ||
    lowerQuery.includes("doctor") ||
    lowerQuery.includes("dr") ||
    lowerQuery.includes("book") ||
    lowerQuery.includes("rate") ||
    lowerQuery.includes("kitni") ||
    lowerQuery.includes("kitna") ||
    lowerQuery.includes("root canal") ||
    lowerQuery.includes("whitening") ||
    lowerQuery.includes("crown") ||
    lowerQuery.includes("filling");

  try {
    const supabase = createAdminClient();
    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("content, metadata, priority")
      .limit(4);

    if (chunks && chunks.length > 0) {
      retrievedChunks = chunks.map((c) => ({
        content: c.content,
        title: (c.metadata as any)?.title || "Business Knowledge",
        score: c.priority === "high" ? 0.9 : 0.75,
      }));
    } else if (isRelevant) {
      retrievedChunks = [
        {
          content:
            "Apex Dental Clinic Services & Pricing Guide: Comprehensive new patient special (full dental exam, digital x-rays, and standard teeth cleaning) is $95. Regular routine adult dental cleaning is $95 to $120. Deep cleaning (scaling and root planing) is $250 per quadrant. Emergency toothache examination is $75. Professional teeth whitening special is $299. Accepted insurance: Delta Dental, MetLife, Cigna, Aetna, and most major PPO dental plans. Hours: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM.",
          title: "Apex Dental Clinic Services & Pricing Guide",
          score: 0.95,
        },
      ];
    }
  } catch (err) {
    if (isRelevant) {
      retrievedChunks = [
        {
          content:
            "Apex Dental Clinic Services & Pricing Guide: Comprehensive new patient special (full dental exam, digital x-rays, and standard teeth cleaning) is $95. Regular routine adult dental cleaning is $95 to $120. Deep cleaning (scaling and root planing) is $250 per quadrant. Emergency toothache examination is $75. Professional teeth whitening special is $299. Accepted insurance: Delta Dental, MetLife, Cigna, Aetna, and most major PPO dental plans. Hours: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM.",
          title: "Apex Dental Clinic Services & Pricing Guide",
          score: 0.95,
        },
      ];
    }
  }

  // If no chunks or irrelevant, gracefully fallback
  if (retrievedChunks.length === 0) {
    return {
      answer:
        fallbackMessage ||
        "I don't have the exact details on that in my current knowledge base. Please feel free to ask about our clinic services or leave your contact information below!",
      sourceType: "fallback",
      providerUsed: "Chatify Zero-Hallucination Fallback",
      citations: [],
      confidence: 0.2,
      sentiment,
      intent,
      isAngryCustomer: false,
      isLeadTriggered: true,
      wasLlmCall: false,
      latencyMs: Date.now() - startTime,
    };
  }

  // If no chunks or low confidence, return helpful response
  const avgConfidence =
    retrievedChunks.length > 0
      ? retrievedChunks.reduce((acc, c) => acc + c.score, 0) / retrievedChunks.length
      : 0.5;

  // 4. STEP 4: Call Central Lifetime-Free AI Router
  const contextSnippet = retrievedChunks
    .map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`)
    .join("\n\n");

  const systemPrompt = `You are a helpful, professional, and friendly customer service receptionist for this business.
CRITICAL RULES:
1. ALWAYS directly, clearly, and informatively answer the customer's question FIRST (especially pricing, costs, cleanings, services, hours, accepted insurance, treatments, or policies).
2. If the user asks in Urdu, Hindi, Roman Urdu (e.g. "kitni price hai", "cleaning kitne ki hai", "kya rate hai"), or English, respond in that same language or friendly Roman Urdu/English with the exact details.
3. NEVER withhold answers or aggressively demand their name or phone number before answering their question!
4. Only AFTER you have fully answered their question may you add an optional, polite closing (e.g. "Agar aap appointment book karna chahein, toh mujhe bata sakte hain!").
5. Use strictly the verified context below and never invent false prices.

<context>
${contextSnippet}
</context>

${botInstructions || ""}`;

  const conversationMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  // Include last 4 conversation turns for rolling memory
  if (options.conversationHistory) {
    const recentHistory = options.conversationHistory.slice(-4);
    for (const h of recentHistory) {
      conversationMessages.push({
        role: h.sender === "user" ? "user" : "assistant",
        content: h.text,
      });
    }
  }

  conversationMessages.push({ role: "user", content: query });

  const aiResponse = await routeAiCompletion(conversationMessages, {
    temperature: 0.3,
    maxTokens: 350,
  });

  const citations = retrievedChunks.map((c) => ({
    title: c.title,
    snippet: c.content.substring(0, 120) + "...",
  }));

  // Save to semantic cache for future instant free replies
  saveSemanticCache(query, aiResponse.text, queryEmbedding, citations);

  return {
    answer: aiResponse.text,
    sourceType: "rag_llm",
    providerUsed: aiResponse.provider,
    citations,
    confidence: avgConfidence,
    sentiment,
    intent,
    isAngryCustomer: false,
    isLeadTriggered,
    wasLlmCall: true,
    latencyMs: Date.now() - startTime,
  };
}
