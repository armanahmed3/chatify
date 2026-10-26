import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const leadSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  conversation_id: z.string().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { public_id: string } }
) {
  try {
    const json = await request.json();
    const parsed = leadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const raw = parsed.data;

    // Strict normalization: any missing or empty field becomes "Not Given"
    const name = raw.name?.trim() ? raw.name.trim() : "Not Given";
    const rawEmail = raw.email?.trim() || "";
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : "Not Given";
    const rawPhone = raw.phone?.trim() || "";
    const phone = rawPhone.replace(/[^\d+]/g, "").length >= 7 ? rawPhone : "Not Given";
    const requirements = raw.requirements?.trim() ? raw.requirements.trim() : "Direct inquiry";
    const conversation_id = raw.conversation_id || null;

    // Automatic lead qualification scoring
    let score: "hot" | "warm" | "cold" = "warm";
    const reqLower = requirements.toLowerCase();
    if (
      phone &&
      (reqLower.includes("book") ||
        reqLower.includes("appointment") ||
        reqLower.includes("emergency") ||
        reqLower.includes("today") ||
        reqLower.includes("tomorrow") ||
        reqLower.includes("cost") ||
        reqLower.includes("quote"))
    ) {
      score = "hot";
    }

    const supabase = createAdminClient();

    // Insert lead into Supabase
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone,
        requirements,
        score,
        qualification_status: "new",
        conversation_id: conversation_id || null,
      })
      .select()
      .single();

    // Send instant owner email alert via Resend on Hot leads
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && score === "hot") {
      try {
        const resend = new Resend(resendApiKey);
        const sender = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const recipient = process.env.OWNER_ALERT_EMAIL || "flexfitfury9@gmail.com";
        await resend.emails.send({
          from: sender,
          to: recipient,
          subject: `🔥 [Hot Lead Alert] ${name} wants an appointment!`,
          html: `
            <h2>New Hot Customer Lead Captured</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Inquiry / Notes:</strong> ${requirements}</p>
            <hr />
            <p>View this conversation in your <a href="https://chatify.ai/dashboard/inbox">Chatify Unified Inbox</a>.</p>
          `,
        });
      } catch (err) {
        // Log silently
      }
    }

    return NextResponse.json({
      ok: true,
      lead_id: lead?.id || `lead-${Date.now()}`,
      score,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
