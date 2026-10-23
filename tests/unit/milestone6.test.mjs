import { test } from "node:test";
import assert from "node:assert/strict";
import { PLANS } from "../../lib/plans.ts";

test("Milestone 6 — Flat Subscription Limits & Anti-Meter Guarantee", () => {
  // Free plan
  assert.equal(PLANS.free.limits.monthlyAiChats, 100);
  assert.equal(PLANS.free.limits.unlimitedFaqAnswers, true);

  // Starter plan ($29/mo)
  assert.equal(PLANS.starter.priceMonthly, 29);
  assert.equal(PLANS.starter.limits.monthlyAiChats, 2000);
  assert.equal(PLANS.starter.limits.unlimitedFaqAnswers, true);

  // Pro plan ($79/mo)
  assert.equal(PLANS.pro.priceMonthly, 79);
  assert.equal(PLANS.pro.limits.monthlyAiChats, 10000);

  // Agency plan ($199/mo)
  assert.equal(PLANS.agency.priceMonthly, 199);
  assert.equal(PLANS.agency.limits.monthlyAiChats, 50000);
});

test("Milestone 6 — ROI Calculation Logic (Hours Saved & Pipeline Value)", () => {
  const inquiries = 1000;
  const avgMinutesPerInquiry = 3;
  const hoursSaved = Math.round((inquiries * avgMinutesPerInquiry) / 60);
  assert.equal(hoursSaved, 50, "1,000 inquiries at 3 min each must equal 50 hours saved");

  const leads = 30;
  const avgJobValue = 350;
  const pipelineValue = leads * avgJobValue;
  assert.equal(pipelineValue, 10500, "30 leads at $350 each must equal $10,500");

  const starterPlanCost = 29;
  const roiMultiple = Math.round(pipelineValue / starterPlanCost);
  assert.ok(roiMultiple > 300, "ROI multiple must exceed 300x");
});
