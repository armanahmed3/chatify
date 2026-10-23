import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  accent_color: z.string().optional().default("#18181b"),
  currency: z.string().optional().default("USD"),
  avg_job_value: z.number().optional().default(300),
});

test("Milestone 2 — Workspace Schema Validation", () => {
  const valid = createWorkspaceSchema.safeParse({
    name: "Downtown Auto Repairs",
    avg_job_value: 450,
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.accent_color, "#18181b");
    assert.equal(valid.data.currency, "USD");
  }

  const invalid = createWorkspaceSchema.safeParse({
    name: "A", // too short
  });
  assert.equal(invalid.success, false);
});

test("Milestone 2 — Non-Technical Customer Rule (No 'API key' in Onboarding/Signup/Pricing)", () => {
  const onboardingFile = path.resolve(process.cwd(), "components/dashboard/onboarding-checklist.tsx");
  const signupFile = path.resolve(process.cwd(), "app/(auth)/signup/page.tsx");
  const pricingFile = path.resolve(process.cwd(), "components/landing/pricing.tsx");

  const onboardingContent = fs.readFileSync(onboardingFile, "utf-8");
  const signupContent = fs.readFileSync(signupFile, "utf-8");
  const pricingContent = fs.readFileSync(pricingFile, "utf-8");

  assert.equal(
    onboardingContent.toLowerCase().includes("api key"),
    false,
    "Onboarding checklist must NEVER contain 'api key'"
  );
  assert.equal(
    signupContent.toLowerCase().includes("api key"),
    false,
    "Signup page must NEVER contain 'api key'"
  );
  assert.equal(
    pricingContent.toLowerCase().includes("api key"),
    false,
    "Pricing page must NEVER contain 'api key'"
  );
});
