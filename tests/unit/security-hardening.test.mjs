import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { isPrivateOrReservedIp, assertSafeUrl } from "../../lib/security/ssrf.ts";
import { validateDocumentUpload, verifyMagicBytes } from "../../lib/security/upload.ts";
import { verifyMetaWebhookSignature, verifyCsrfOrigin } from "../../lib/security/webhooks.ts";
import { checkRateLimit, RATE_LIMIT_TIERS } from "../../lib/security/ratelimit.ts";

test("Security — SSRF Validator Blocks Loopback, Private IPs & Cloud Metadata", () => {
  // Block Cloud metadata (AWS/GCP/Azure)
  assert.equal(isPrivateOrReservedIp("169.254.169.254"), true);

  // Block localhost and IPv4 loopback
  assert.equal(isPrivateOrReservedIp("127.0.0.1"), true);
  assert.equal(isPrivateOrReservedIp("127.1.2.3"), true);

  // Block private subnets
  assert.equal(isPrivateOrReservedIp("10.0.0.1"), true);
  assert.equal(isPrivateOrReservedIp("192.168.1.1"), true);
  assert.equal(isPrivateOrReservedIp("172.16.0.5"), true);
  assert.equal(isPrivateOrReservedIp("172.31.255.255"), true);

  // Allow legitimate public IPs
  assert.equal(isPrivateOrReservedIp("8.8.8.8"), false);
  assert.equal(isPrivateOrReservedIp("104.21.5.12"), false);

  // URL string check
  assert.equal(assertSafeUrl("http://localhost:3000/admin").isValid, false);
  assert.equal(assertSafeUrl("http://169.254.169.254/latest/meta-data").isValid, false);
  assert.equal(assertSafeUrl("http://192.168.1.50/dashboard").isValid, false);
  assert.equal(assertSafeUrl("ftp://apex-dental.com").isValid, false);

  // Safe external URL passes
  const safeCheck = assertSafeUrl("https://apex-dental.com/services");
  assert.equal(safeCheck.isValid, true);
  assert.equal(safeCheck.safeUrl, "https://apex-dental.com/services");
});

test("Security — File Upload Validator & Magic Bytes Integrity", () => {
  // 1. PDF magic bytes %PDF
  const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
  assert.equal(verifyMagicBytes(validPdfBytes, "application/pdf"), true);

  // Tampered file (fake .pdf extension with exe bytes)
  const fakePdfBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // MZ Windows executable header
  assert.equal(verifyMagicBytes(fakePdfBytes, "application/pdf"), false);

  // 2. Size capping (max 10MB)
  const validDoc = validateDocumentUpload("services.pdf", 500000, "application/pdf", validPdfBytes);
  assert.equal(validDoc.isValid, true);
  assert.equal(validDoc.sanitizedFilename, "services.pdf");

  const oversizedDoc = validateDocumentUpload("big.pdf", 15 * 1024 * 1024, "application/pdf", validPdfBytes);
  assert.equal(oversizedDoc.isValid, false);
  assert.match(oversizedDoc.error, /exceeds maximum allowed size/);

  // 3. Dangerous extensions (.exe, .sh, .php)
  const maliciousDoc = validateDocumentUpload("exploit.php", 200, "application/x-php");
  assert.equal(maliciousDoc.isValid, false);
});

test("Security — Webhook HMAC-SHA256 Cryptographic Verification", () => {
  const secret = "chatify_production_meta_secret_998877";
  const payload = JSON.stringify({ object: "whatsapp_business_account", entry: [] });

  // Generate valid HMAC
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload, "utf8");
  const validSignature = `sha256=${hmac.digest("hex")}`;

  // Valid signature verifies true
  assert.equal(verifyMetaWebhookSignature(payload, validSignature, secret), true);

  // Altered payload fails verification
  const alteredPayload = JSON.stringify({ object: "whatsapp_business_account", entry: ["hacked"] });
  assert.equal(verifyMetaWebhookSignature(alteredPayload, validSignature, secret), false);

  // Wrong secret fails verification
  assert.equal(verifyMetaWebhookSignature(payload, validSignature, "wrong_secret"), false);
});

test("Security — CSRF Origin Guard", () => {
  const allowed = ["https://chatify.ai", "http://localhost:3000"];

  assert.equal(verifyCsrfOrigin("https://chatify.ai", allowed), true);
  assert.equal(verifyCsrfOrigin("http://localhost:3000", allowed), true);
  assert.equal(verifyCsrfOrigin("https://malicious-attacker.com", allowed), false);
});

test("Security — Rate Limiting Sliding Window Enforcement", async () => {
  const testId = `test-user-${Date.now()}`;

  // Auth tier limit: 5 requests
  for (let i = 0; i < 5; i++) {
    const res = await checkRateLimit(testId, "AUTH_LOGIN");
    assert.equal(res.success, true);
  }

  // 6th request must be throttled
  const blockedRes = await checkRateLimit(testId, "AUTH_LOGIN");
  assert.equal(blockedRes.success, false);
  assert.equal(blockedRes.remaining, 0);
  assert.ok(blockedRes.reset > 0);
});

test("Security — Anti-Trial Abuse Engine Blocks Disposable Domains & Duplicates", async () => {
  const { isDisposableEmail, isAliasedEmail, validateEmailSecurity, normalizeEmail, checkTrialEligibility, recordActivatedTrial } = await import("../../lib/security/anti-abuse.ts");

  // Disposable emails blocked
  assert.equal(isDisposableEmail("attacker@mailinator.com"), true);
  assert.equal(isDisposableEmail("bot@tempmail.com"), true);
  assert.equal(isDisposableEmail("spammer@10minutemail.com"), true);
  assert.equal(isDisposableEmail("nenitip897@hopefunder.com"), true);
  assert.equal(isDisposableEmail("test@inboxes.com"), true);
  assert.equal(isDisposableEmail("spammer@1secmail.com"), true);
  assert.equal(isDisposableEmail("legit.doctor@gmail.com"), false);
  assert.equal(isDisposableEmail("director@skylinelegal.com"), false);

  // Sub-addressed / plus-alias bulk abuse blocked (mudasirit+1@gmail.com)
  assert.equal(isAliasedEmail("mudasirit+1@gmail.com"), true);
  assert.equal(isAliasedEmail("mudasirit+2@gmail.com"), true);
  assert.equal(isAliasedEmail("mudasirit@gmail.com"), false);
  assert.equal(validateEmailSecurity("mudasirit+1@gmail.com").valid, false);
  assert.equal(validateEmailSecurity("mudasirit@gmail.com").valid, true);

  // Email normalization
  assert.equal(normalizeEmail("Test.Doctor+trial1@gmail.com"), "testdoctor@gmail.com");

  // Trial eligibility & durable ledger
  const testEmail = `doctor.trial.${Date.now()}@practice.org`;
  const testPhone = "+15554321099";
  const deviceHash = "device-hash-xyz-99";

  const firstCheck = checkTrialEligibility({ email: testEmail, phone: testPhone, deviceHash });
  assert.equal(firstCheck.eligible, true);

  // Activate trial
  recordActivatedTrial({ email: testEmail, phone: testPhone, deviceHash, businessName: "Test Clinic" });

  // Repeat trial attempt blocked
  const secondCheck = checkTrialEligibility({ email: testEmail, phone: testPhone, deviceHash });
  assert.equal(secondCheck.eligible, false);
  assert.match(secondCheck.reason, /already been claimed/i);
});

test("Security — Supabase Migration Hardening Schema & Search Path Integrity", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261025000002_security_hardening.sql");
  assert.ok(fs.existsSync(migrationPath), "Hardening migration must exist");

  const sql = fs.readFileSync(migrationPath, "utf-8");
  assert.ok(sql.includes("SET search_path = public"), "Search path must be explicitly pinned to public");
  assert.ok(sql.includes("FORCE ROW LEVEL SECURITY"), "Force RLS must be declared on sensitive tables");
  assert.ok(sql.includes("storage.objects"), "Storage object RLS policies must be configured");
  assert.ok(sql.includes("REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.subscriptions"), "Subscriptions table grants must be restricted");
});
