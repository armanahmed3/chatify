import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverError, getClientIp } from "@/lib/http";
import { executeRagQuery } from "@/lib/ai/rag";
import { verifyMetaWebhookSignature } from "@/lib/security/webhooks";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { logger } from "@/lib/logger";

/**
 * Meta Webhook Verification Handshake (GET)
 * Validates hub.verify_token and returns hub.challenge string
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!expectedToken) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const a = Buffer.from(token || "");
  const b = Buffer.from(expectedToken);
  const tokenOk = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (mode === "subscribe" && tokenOk && challenge && /^[\w-]{1,200}$/.test(challenge)) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * Inbound Meta Message Ingest (POST)
 * Supports WhatsApp Cloud API, Instagram DM, and Facebook Messenger
 * Cryptographically verifies x-hub-signature-256 HMAC-SHA256
 */
export async function POST(request: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(getClientIp(request), "WEBHOOKS");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const appSecret = process.env.META_APP_SECRET;

    // Cryptographic signature check — mandatory in production.
    if (!appSecret) {
      if (process.env.NODE_ENV === "production") {
        logger.error("META_APP_SECRET missing in production; rejecting webhook");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
      }
    } else if (!verifyMetaWebhookSignature(rawBody, signature, appSecret)) {
      logger.warn("Meta webhook signature mismatch rejected");
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Check if this is a WhatsApp message entry
    if (payload.object === "whatsapp_business_account") {
      const entry = payload.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message && message.type === "text") {
        const fromNumber = message.from; // Customer phone number
        const textBody = String(message.text?.body || "").slice(0, 2000); // Inbound user question
        if (!textBody) return NextResponse.json({ status: "EVENT_RECEIVED" });

        // Execute unified RAG pipeline for this business bot
        const ragResult = await executeRagQuery({
          botId: "demo-apex",
          publicId: "demo-apex",
          query: textBody,
        });

        // Send reply back via Meta WhatsApp Cloud API
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        if (phoneNumberId && accessToken) {
          await fetch(
            `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: fromNumber,
                type: "text",
                text: { body: ragResult.answer },
              }),
            }
          );
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" });
  } catch (err: any) {
    return serverError(err, "channels.meta.webhook");
  }
}
