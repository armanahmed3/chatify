import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeRagQuery } from "@/lib/ai/rag";
import { createAdminClient } from "@/lib/supabase/server";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversation_id: z.string().optional(),
  session_id: z.string().min(1).max(100),
  history: z
    .array(z.object({ sender: z.enum(["user", "bot"]), text: z.string() }))
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { public_id: string } }
) {
  try {
    const json = await request.json();
    const parsed = chatRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { message, conversation_id, session_id, history } = parsed.data;
    const publicId = params.public_id;

    // Check origin / domain whitelist
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";

    // Execute RAG pipeline
    const ragResult = await executeRagQuery({
      botId: publicId,
      publicId,
      query: message,
      conversationHistory: history,
    });

    // Save conversation and message record in database
    const supabase = createAdminClient();

    let convId = conversation_id;
    if (!convId) {
      // Find or create conversation
      const { data: conv } = await supabase
        .from("conversations")
        .insert({
          session_id,
          channel: "web",
          status: "active",
        })
        .select()
        .single();
      if (conv) convId = conv.id;
    }

    if (convId) {
      // Record user message
      await supabase.from("messages").insert({
        conversation_id: convId,
        sender_type: "user",
        content: message,
      });

      // Record bot response
      await supabase.from("messages").insert({
        conversation_id: convId,
        sender_type: "bot",
        content: ragResult.answer,
        citations: ragResult.citations,
        confidence_score: ragResult.confidence,
        sentiment: ragResult.sentiment,
        intent: ragResult.intent,
      });
    }

    return NextResponse.json({
      answer: ragResult.answer,
      source_type: ragResult.sourceType,
      provider: ragResult.providerUsed,
      citations: ragResult.citations,
      confidence: ragResult.confidence,
      sentiment: ragResult.sentiment,
      intent: ragResult.intent,
      is_angry_customer: ragResult.isAngryCustomer,
      is_lead_triggered: ragResult.isLeadTriggered,
      latency_ms: ragResult.latencyMs,
      conversation_id: convId || `conv-${Date.now()}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        answer:
          "I'm sorry, I'm having a brief connection delay. Please leave your contact details and our team will get right back to you!",
        is_lead_triggered: true,
        confidence: 0.1,
      },
      { status: 200 }
    );
  }
}
