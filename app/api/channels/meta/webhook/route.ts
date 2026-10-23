import { NextRequest, NextResponse } from "next/server";
import { executeRagQuery } from "@/lib/ai/rag.ts";

/**
 * Meta Webhook Verification Handshake (GET)
 * Validates hub.verify_token and returns hub.challenge string
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.META_WEBHOOK_VERIFY_TOKEN || "chatify_meta_verify_secret_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * Inbound Meta Message Ingest (POST)
 * Supports WhatsApp Cloud API, Instagram DM, and Facebook Messenger
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Check if this is a WhatsApp message entry
    if (payload.object === "whatsapp_business_account") {
      const entry = payload.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message && message.type === "text") {
        const fromNumber = message.from; // Customer phone number
        const textBody = message.text?.body; // Inbound user question

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
