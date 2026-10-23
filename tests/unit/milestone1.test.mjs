import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PLANS, RECEPTIONIST_COMPARISON, BILLING_PROMISES } from "../../lib/plans.ts";
import { formatCurrency } from "../../lib/utils.ts";

test("Milestone 1 — Plans Configuration & Flat Pricing Integrity", () => {
  assert.ok(PLANS.free, "Free plan must exist");
  assert.ok(PLANS.starter, "Starter plan must exist");
  assert.ok(PLANS.pro, "Pro plan must exist");
  assert.ok(PLANS.agency, "Agency plan must exist");

  // Starter Plan rules
  assert.equal(PLANS.starter.priceMonthly, 29);
  assert.equal(PLANS.starter.limits.maxBots, 2);
  assert.equal(PLANS.starter.limits.monthlyAiChats, 2000);
  assert.equal(PLANS.starter.limits.unlimitedFaqAnswers, true);

  // Pro Plan rules
  assert.equal(PLANS.pro.priceMonthly, 79);
  assert.equal(PLANS.pro.limits.maxBots, 5);
  assert.equal(PLANS.pro.limits.monthlyAiChats, 10000);
  assert.equal(PLANS.pro.limits.omnichannelMeta, true);

  // Agency Plan rules
  assert.equal(PLANS.agency.priceMonthly, 199);
  assert.equal(PLANS.agency.limits.maxBots, 25);
  assert.equal(PLANS.agency.limits.whiteLabel, true);

  // Receptionist comparison
  assert.equal(RECEPTIONIST_COMPARISON.humanMonthlyCost, 2000);
  assert.equal(RECEPTIONIST_COMPARISON.chatifyStarterMonthly, 29);
  assert.equal(RECEPTIONIST_COMPARISON.monthlySavings, 1971);

  // No per-message fees guarantee
  assert.ok(
    BILLING_PROMISES.some((p) => p.toLowerCase().includes("no per-message fees")),
    "Billing promises must guarantee no per-message fees"
  );
});

test("Milestone 1 — Supabase Migration Schema & RLS Integrity", () => {
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261023000000_init.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");

  const sql = fs.readFileSync(migrationPath, "utf-8");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.workspaces"), "Workspaces table must exist");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.chatbots"), "Chatbots table must exist");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.document_chunks"), "Document chunks table must exist");
  assert.ok(sql.toLowerCase().includes("vector(768)"), "Vector extension and 768-dim column must exist");
  assert.ok(sql.toLowerCase().includes("using hnsw"), "HNSW index must be configured for vector search");
  assert.ok(sql.includes("ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY"), "RLS must be enabled on workspaces");
  assert.ok(sql.includes("ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY"), "RLS must be enabled on chatbots");
  assert.ok(sql.includes("ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY"), "RLS must be enabled on document chunks");
});

test("Milestone 1 — Currency Formatting Utility", () => {
  assert.equal(formatCurrency(29), "$29");
  assert.equal(formatCurrency(199), "$199");
});
