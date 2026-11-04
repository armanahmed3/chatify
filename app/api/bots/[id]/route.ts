import { NextRequest, NextResponse } from "next/server";
import { serverError, getClientIp } from "@/lib/http";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyBotOwnership, recordAuditLog } from "@/lib/auth/guard";
import { checkRateLimit } from "@/lib/security/ratelimit";

const updateBotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  personality: z.string().max(200).optional(),
  tone: z.string().max(100).optional(),
  temperature: z.number().min(0).max(1).optional(),
  instructions: z.string().max(5000).optional(),
  fallback_message: z.string().max(500).optional(),
  primary_language: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const authCheck = await verifyBotOwnership(params.id, "viewer");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chatbots")
      .select("*, widget_settings(*)")
      .eq("id", params.id)
      .single();

    if ((error || !data) && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Bot not found." }, { status: 404 });
    }
    if (error || !data) {
      return NextResponse.json({
        bot: {
          id: params.id,
          name: "Apex Dental Assistant",
          personality: "compassionate, professional, and clear",
          tone: "friendly",
          temperature: 0.3,
          instructions: "Help patients book appointments and answer dental FAQs accurately.",
          fallback_message: "Please leave your phone number and we will call you back right away.",
          primary_language: "auto",
          is_active: true,
          widget_settings: {
            primary_color: "#2563eb",
            header_title: "Apex Dental Assistant",
            welcome_message: "Hello! How can we help you today?",
            position: "bottom-right",
            suggested_questions: ["Do you take insurance?", "What are your hours?"],
          },
        },
      });
    }

    return NextResponse.json({ bot: data });
  } catch (err: any) {
    return serverError(err, "bots.[id]");
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const rateCheck = await checkRateLimit(getClientIp(request), "GENERAL_API");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const authCheck = await verifyBotOwnership(params.id, "admin");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const json = await request.json();
    const parsed = updateBotSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid chatbot settings.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chatbots")
      .update(parsed.data)
      .eq("id", params.id)
      .select()
      .single();

    await recordAuditLog({
      userId: authCheck.user?.userId,
      action: "bot.update",
      resourceType: "chatbot",
      resourceId: params.id,
      metadata: parsed.data,
    });

    if (error && process.env.NODE_ENV === "production") {
      return serverError(error, "bots.update");
    }
    if (error) {
      return NextResponse.json({ bot: { id: params.id, ...parsed.data } });
    }

    return NextResponse.json({ bot: data });
  } catch (err: any) {
    return serverError(err, "bots.[id]");
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const authCheck = await verifyBotOwnership(params.id, "owner");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabase = await createClient();
    await supabase.from("chatbots").delete().eq("id", params.id);

    await recordAuditLog({
      userId: authCheck.user?.userId,
      action: "bot.delete",
      resourceType: "chatbot",
      resourceId: params.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return serverError(err, "bots.[id]");
  }
}
