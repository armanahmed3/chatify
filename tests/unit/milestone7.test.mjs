import { test } from "node:test";
import assert from "node:assert/strict";
import { executeAiAction } from "../../lib/ai/actions.ts";
import { INDUSTRY_TEMPLATES } from "../../lib/templates.ts";

test("Milestone 7 — AI Actions Framework (Booking, Coupons, Products)", async () => {
  // Appointment Action
  const bookingAction = {
    id: "act-1",
    type: "appointment",
    name: "Book Appointment",
    description: "Calendly Integration",
    settings: { booking_url: "https://calendly.com/apex-dental" },
    isEnabled: true,
  };
  const bookRes = await executeAiAction(bookingAction, { service: "Root Canal" });
  assert.equal(bookRes.success, true);
  assert.ok(bookRes.displayText.includes("https://calendly.com/apex-dental"));

  // Coupon Action
  const couponAction = {
    id: "act-2",
    type: "coupon",
    name: "First Time Coupon",
    description: "New visitor coupon",
    settings: { discount_percent: 20 },
    isEnabled: true,
  };
  const couponRes = await executeAiAction(couponAction, {});
  assert.equal(couponRes.success, true);
  assert.ok(couponRes.resultPayload.code.startsWith("SAVE20-"));
});

test("Milestone 7 — 8 Industry Turnkey Templates Completeness", () => {
  const expectedIndustries = [
    "restaurant",
    "dental",
    "garage",
    "salon",
    "real_estate",
    "ecommerce",
    "law_firm",
    "gym",
  ];

  for (const ind of expectedIndustries) {
    const tpl = INDUSTRY_TEMPLATES[ind];
    assert.ok(tpl, `Template for ${ind} must exist`);
    assert.ok(tpl.qaPairs.length >= 2, `${ind} must include ready Q&A pairs`);
    assert.ok(tpl.suggestedQuestions.length >= 2, `${ind} must include suggested prompts`);
    assert.ok(tpl.leadSettings, `${ind} must define lead settings`);
  }
});
