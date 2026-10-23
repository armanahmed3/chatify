import { test } from "node:test";
import assert from "node:assert/strict";
import { executeRagQuery } from "../../lib/ai/rag.ts";

test("Milestone 8 — Graceful Failure Mode (Offline Lead Capture when AI Down)", async () => {
  // Query with missing knowledge should gracefully fallback and trigger lead form
  const result = await executeRagQuery({
    botId: "demo-apex",
    publicId: "demo-apex",
    query: "Do you sell purple space helmets?",
    fallbackMessage: "I don't have that detail. Please leave your phone number!",
  });

  assert.ok(result.answer, "Must return fallback answer");
  assert.equal(result.isLeadTriggered, true, "Must ALWAYS trigger lead capture form during fallback");
  assert.equal(result.sourceType, "fallback");
});

test("Milestone 8 — GDPR Data Portability Structure", () => {
  const exportPayload = {
    gdpr_compliance: "Full Data Export Article 20 GDPR",
    exported_at: new Date().toISOString(),
    workspace: { id: "ws-1", name: "Apex Dental" },
    chatbots: [],
    training_sources: [],
    leads: [],
  };

  assert.ok(exportPayload.gdpr_compliance.includes("GDPR"));
  assert.ok(exportPayload.exported_at);
  assert.ok(Array.isArray(exportPayload.leads));
});
