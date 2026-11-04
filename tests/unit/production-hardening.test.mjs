import test from "node:test";
import assert from "node:assert/strict";

import { generateTotp, verifyTotp, generateTotpSecret, base32Encode, base32Decode } from "../../lib/security/totp.ts";
import { isPrivateIpv6, assertSafeUrlResolved } from "../../lib/security/ssrf.ts";
import { verifyMagicBytes, ALLOWED_IMAGE_MIMES, validateDocumentUpload } from "../../lib/security/upload.ts";
import { escapeHtml } from "../../lib/security/escape.ts";

test("TOTP — RFC 6238 SHA1 test vector", () => {
  // RFC 6238 Appendix B: secret "12345678901234567890", T=59s -> 94287082 (8 digits) => last 6 = 287082
  const secret = base32Encode(Buffer.from("12345678901234567890"));
  assert.equal(generateTotp(secret, 59 * 1000), "287082");
  assert.equal(base32Decode(secret).toString(), "12345678901234567890");
});

test("TOTP — verify accepts ±1 step, rejects others and malformed input", () => {
  const secret = generateTotpSecret();
  const now = Date.now();
  assert.equal(verifyTotp(secret, generateTotp(secret, now), 1, now), true);
  assert.equal(verifyTotp(secret, generateTotp(secret, now - 30_000), 1, now), true);
  assert.equal(verifyTotp(secret, generateTotp(secret, now - 120_000), 1, now), false);
  assert.equal(verifyTotp(secret, "12345", 1, now), false);
  assert.equal(verifyTotp(null, "123456", 1, now), false);
  // The old "any 6 chars" MFA bypass must not work
  assert.equal(verifyTotp(secret, "abcdef", 1, now), false);
});

test("SSRF — IPv6 private ranges & DNS-resolved private hosts are blocked", async () => {
  assert.equal(isPrivateIpv6("::1"), true);
  assert.equal(isPrivateIpv6("fd00::1"), true);
  assert.equal(isPrivateIpv6("fe80::1"), true);
  assert.equal(isPrivateIpv6("::ffff:127.0.0.1"), true);
  assert.equal(isPrivateIpv6("2606:4700:4700::1111"), false);

  const loop = await assertSafeUrlResolved("http://localhost.:8080/");
  assert.equal(loop.isValid, false);
  const v6 = await assertSafeUrlResolved("http://[::1]/");
  assert.equal(v6.isValid, false);
  const meta = await assertSafeUrlResolved("http://169.254.169.254/latest/meta-data");
  assert.equal(meta.isValid, false);
});

test("Uploads — SVG disallowed, unknown types rejected, text with script rejected", () => {
  assert.equal(ALLOWED_IMAGE_MIMES.has("image/svg+xml"), false);
  assert.equal(verifyMagicBytes(new Uint8Array([1, 2, 3, 4]), "application/x-msdownload"), false);
  const evil = new TextEncoder().encode("name,notes\nbob,<script>alert(1)</script>");
  assert.equal(verifyMagicBytes(evil, "text/csv"), false);
  const ok = new TextEncoder().encode("name,notes\nbob,hello");
  assert.equal(verifyMagicBytes(ok, "text/csv"), true);
  const res = validateDocumentUpload("../../etc/passwd.txt", 10, "text/plain");
  assert.equal(res.isValid, true);
  assert.ok(!res.sanitizedFilename.includes("/"));
  assert.ok(!res.sanitizedFilename.startsWith("."));
});

test("XSS — escapeHtml neutralises markup in email templates", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert(1)">`), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});

test("Logs — secrets, JWTs and PII are redacted", async () => {
  const { logger } = await import("../../lib/logger.ts");
  const lines = [];
  const orig = console.warn;
  console.warn = (l) => lines.push(l);
  try {
    logger.warn("x", {
      password: "hunter2",
      email: "jane.doe@example.com",
      phone: "+15551234567",
      note: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc",
      apiKey: "gsk_abc",
    });
  } finally {
    console.warn = orig;
  }
  const out = lines.join("");
  assert.ok(!out.includes("hunter2"));
  assert.ok(!out.includes("jane.doe@example.com"));
  assert.ok(!out.includes("5551234567"));
  assert.ok(!out.includes("eyJhbGciOiJIUzI1NiJ9"));
  assert.ok(!out.includes("gsk_abc"));
});

test("Repo hygiene — no hardcoded demo credentials or committed env files", async () => {
  const fs = await import("node:fs");
  const store = fs.readFileSync(new URL("../../lib/auth/user-store.ts", import.meta.url), "utf8");
  assert.ok(!store.includes("AdminSecure2026!"));
  assert.ok(!store.includes("UserPass2026!"));
  const signup = fs.readFileSync(new URL("../../app/api/auth/signup/route.ts", import.meta.url), "utf8");
  assert.match(signup, /IS_PROD \? \{\} : \{ devEmailOtp/);
  const gi = fs.readFileSync(new URL("../../.gitignore", import.meta.url), "utf8");
  assert.match(gi, /\.env\*\.local/);
  const di = fs.readFileSync(new URL("../../.dockerignore", import.meta.url), "utf8");
  assert.match(di, /^\.env\.\*$/m);
});
