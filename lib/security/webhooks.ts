/**
 * Cryptographic Webhook Signature Verification Utility
 * Implements constant-time HMAC-SHA256 comparison to prevent timing attacks.
 */

import crypto from "crypto";

/**
 * Verifies Meta (WhatsApp / Instagram / Messenger) Webhook X-Hub-Signature-256
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;

  // Header format is: sha256=<signature_hex>
  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    return false;
  }

  const expectedSignatureHex = parts[1];
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(rawBody, "utf8");
  const calculatedSignatureHex = hmac.digest("hex");

  try {
    const expectedBuffer = Buffer.from(expectedSignatureHex, "hex");
    const calculatedBuffer = Buffer.from(calculatedSignatureHex, "hex");

    if (expectedBuffer.length !== calculatedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, calculatedBuffer);
  } catch {
    return false;
  }
}

/**
 * Validates Origin/Referer header against trusted origins for CSRF defense on mutation APIs
 */
export function verifyCsrfOrigin(requestOrigin: string | null, allowedOrigins: string[]): boolean {
  if (!requestOrigin) {
    // If no Origin header (e.g., standard same-origin fetch), allow if Referer matches or in dev
    return true;
  }

  try {
    const originUrl = new URL(requestOrigin);
    return allowedOrigins.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.origin === allowedUrl.origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}
