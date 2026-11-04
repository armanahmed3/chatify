import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { serverError, getClientIp } from "@/lib/http";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { resolvePublicBot, conversationBelongsTo, isUuid } from "@/lib/chat/public-bot";

const feedbackSchema = z.object({
  message_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  session_id: z.string().min(1).max(100),
  feedback: z.enum(["up", "down"]),
  note: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ public_id: string }> }
) {
  const params = await props.params;
  try {
    const rate = await checkRateLimit(getClientIp(request), "WIDGET_SUBMIT");
    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
    }
    const { message_id, conversation_id, session_id, feedback } = parsed.data;

    const bot = await resolvePublicBot(params.public_id);
    if (!bot || !isUuid(message_id)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // BOLA: the visitor may only rate bot messages inside their own conversation with this bot.
    if (!(await conversationBelongsTo(conversation_id, bot, session_id))) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const supabase = createAdminClient();
    await supabase
      .from("messages")
      .update({ feedback })
      .eq("id", message_id)
      .eq("conversation_id", conversation_id)
      .eq("sender_type", "bot");

    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, "chat.feedback");
  }
}
