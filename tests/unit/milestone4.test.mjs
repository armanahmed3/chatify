import { test } from "node:test";
import assert from "node:assert/strict";
import { routeAiCompletion } from "../../lib/ai/router.ts";
import { cosineSimilarity, lookupSemanticCache } from "../../lib/ai/cache.ts";
import { classifySentimentAndIntent, executeRagQuery } from "../../lib/ai/rag.ts";

test("Milestone 4 — Lifetime-Free AI Router Fallback & Execution", async () => {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What are your emergency dental hours?" },
  ];

  const res = await routeAiCompletion(messages, { maxTokens: 100 });
  assert.ok(res.text && res.text.length > 0, "Router must always return valid response");
  assert.ok(res.provider, "Router must log provider used");
  assert.ok(res.latencyMs >= 0, "Router must measure latency");
});

test("Milestone 4 — Cosine Similarity & Semantic Cache", async () => {
  const vecA = [1, 0, 0, 0];
  const vecB = [1, 0, 0, 0];
  const vecC = [0, 1, 0, 0];

  assert.equal(cosineSimilarity(vecA, vecB), 1.0);
  assert.equal(cosineSimilarity(vecA, vecC), 0.0);

  // Exact match in cache
  const cached = await lookupSemanticCache("Do you accept Delta Dental insurance?", []);
  assert.ok(cached, "Should match exact query in semantic cache");
  assert.equal(cached.citations.length > 0, true);
});

test("Milestone 4 — Sentiment & Intent Classification (Sales, Booking, Angry Alert)", () => {
  const booking = classifySentimentAndIntent("I need to book an appointment for tomorrow");
  assert.equal(booking.intent, "booking");
  assert.equal(booking.isLeadTriggered, true);
  assert.equal(booking.isAngryCustomer, false);

  const sales = classifySentimentAndIntent("How much is the cost for root canal treatment?");
  assert.equal(sales.intent, "sales");
  assert.equal(sales.isLeadTriggered, true);

  const angry = classifySentimentAndIntent("Your receptionist was terrible and awful, I want to speak to a manager right now!");
  assert.equal(angry.sentiment, "angry");
  assert.equal(angry.intent, "complaint");
  assert.equal(angry.isAngryCustomer, true);
  assert.equal(angry.isLeadTriggered, true);
});

test("Milestone 4 — Answers-Before-AI Execution & Zero Hallucination Fallback", async () => {
  // Query that matches semantic cache
  const resultCache = await executeRagQuery({
    botId: "demo-apex",
    publicId: "demo-apex",
    query: "Do you accept Delta Dental insurance?",
  });
  assert.equal(resultCache.sourceType, "semantic_cache");
  assert.equal(resultCache.wasLlmCall, false, "Cache hits must NOT count as LLM calls ($0 cost)");

  // Angry customer trigger
  const angryResult = await executeRagQuery({
    botId: "demo-apex",
    publicId: "demo-apex",
    query: "This is a terrible scam!",
  });
  assert.equal(angryResult.isAngryCustomer, true);
  assert.equal(angryResult.isLeadTriggered, true);
});
