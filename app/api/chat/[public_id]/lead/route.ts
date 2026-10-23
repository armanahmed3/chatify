import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  requirements: z.string().optional().default("General inquiry"),
  conversation_id: z.string().optional(),
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

    const { name, email, phone, requirements, conversation_id } = parsed.data;

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
