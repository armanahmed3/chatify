import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { serverError, getClientIp, escapeHtml } from "@/lib/http";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { resolvePublicBot, conversationBelongsTo, allowDemoBots } from "@/lib/chat/public-bot";
import { logger } from "@/lib/logger";

const leadSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  email: z.string().max(255).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  requirements: z.string().max(2000).optional().nullable(),
  conversation_id: z.string().max(100).optional().nullable(),
  session_id: z.string().max(100).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ public_id: string }> }
) {
  const params = await props.params;
  try {
    const rate = await checkRateLimit(getClientIp(request), "WIDGET_SUBMIT");
    if (!rate.success) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    const parsed = leadSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lead details." }, { status: 400 });
    }

    const bot = await resolvePublicBot(params.public_id);
    if (!bot && !allowDemoBots()) {
      return NextResponse.json({ error: "Chatbot not found." }, { status: 404 });
    }

    const raw = parsed.data;

    // Strict normalization: any missing or empty field becomes "Not Given"
    const name = raw.name?.trim() ? raw.name.trim() : "Not Given";
    const rawEmail = raw.email?.trim() || "";
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : "Not Given";
    const rawPhone = raw.phone?.trim() || "";
    const phone = rawPhone.replace(/[^\d+]/g, "").length >= 7 ? rawPhone : "Not Given";
    const requirements = raw.requirements?.trim() ? raw.requirements.trim() : "Direct inquiry";

    // Only link a conversation that belongs to this bot + widget session (BOLA protection).
    let conversation_id: string | null = null;
    if (bot && raw.conversation_id && raw.session_id) {
      if (await conversationBelongsTo(raw.conversation_id, bot, raw.session_id)) {
        conversation_id = raw.conversation_id;
      }
    }

    // Automatic lead qualification scoring
    let score: "hot" | "warm" | "cold" = "warm";
    const reqLower = requirements.toLowerCase();
    if (
      phone !== "Not Given" &&
      ["book", "appointment", "emergency", "today", "tomorrow", "cost", "quote"].some((k) =>
        reqLower.includes(k)
      )
    ) {
      score = "hot";
    }

    let leadId: string | null = null;
    if (bot) {
      const supabase = createAdminClient();
      const { data: lead } = await supabase
        .from("leads")
        .insert({
          workspace_id: bot.workspace_id,
          chatbot_id: bot.id,
          name,
          email,
          phone,
          requirements,
          score,
          qualification_status: "new",
          conversation_id,
        })
        .select("id")
        .single();
      leadId = lead?.id ?? null;
    }

    // Instant owner email alert on hot leads. All visitor-supplied values are HTML-escaped.
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.OWNER_ALERT_EMAIL;
    if (resendApiKey && recipient && score === "hot") {
      try {
        const resend = new Resend(resendApiKey);
        const sender = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        await resend.emails.send({
          from: sender,
          to: recipient,
          subject: `[Hot Lead] ${name.replace(/[\r\n]/g, " ").slice(0, 60)} wants an appointment`,
          html: `
            <h2>New Hot Customer Lead Captured</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Inquiry / Notes:</strong> ${escapeHtml(requirements)}</p>
            <hr />
            <p>View this conversation in your <a href="${escapeHtml(appUrl)}/dashboard/inbox">Chatify Inbox</a>.</p>
          `,
        });
      } catch (err) {
        logger.error("Hot lead alert email failed", err);
      }
    }

    return NextResponse.json({ ok: true, lead_id: leadId, score });
  } catch (err) {
    return serverError(err, "chat.lead");
  }
}
