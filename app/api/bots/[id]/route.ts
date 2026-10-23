import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chatbots")
      .select("*, widget_settings(*)")
      .eq("id", params.id)
      .single();

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("chatbots")
      .update(json)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ bot: { id: params.id, ...json } });
    }

    return NextResponse.json({ bot: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    await supabase.from("chatbots").delete().eq("id", params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
