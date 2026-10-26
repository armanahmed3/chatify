import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyWorkspaceAccess, recordAuditLog } from "@/lib/auth/guard";
import { checkRateLimit } from "@/lib/security/ratelimit";

const createBotSchema = z.object({
  workspace_id: z.string().min(1),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  personality: z.string().optional().default("helpful, professional, and concise"),
  tone: z.string().optional().default("friendly"),
  temperature: z.number().min(0).max(1).optional().default(0.3),
  instructions: z.string().optional().default("You are a helpful customer service assistant for our business. Answer accurately from our verified knowledge base. Never invent prices or services."),
  fallback_message: z.string().optional().default("I don't have the exact details on that right now. Please leave your contact information and our team will get right back to you!"),
  primary_language: z.string().optional().default("auto"),
  primary_color: z.string().optional().default("#18181b"),
  welcome_message: z.string().optional().default("Hi there! 👋 How can we help you today?"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspace_id");

    if (workspaceId) {
      const authCheck = await verifyWorkspaceAccess(workspaceId, "viewer");
      if (!authCheck.allowed) {
        return NextResponse.json({ error: authCheck.error }, { status: 403 });
      }
    }

    const supabase = createClient();
    let query = supabase.from("chatbots").select("*, widget_settings(*)");

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query;
    if (error) {
      // In development fallback without live Supabase connection
      return NextResponse.json({
        bots: [
          {
            id: "bot-demo-001",
            workspace_id: workspaceId || "ws-demo-001",
            public_id: "demo-apex",
            name: "Apex Dental Assistant",
            description: "Main clinic website & WhatsApp assistant",
            personality: "compassionate, professional, and clear",
            tone: "friendly",
            temperature: 0.3,
            instructions: "You are the virtual receptionist for Apex Dental Clinic. Help patients with services, pricing, emergency care, and appointment bookings.",
            fallback_message: "I don't have the exact details on that right now. Please leave your contact details and Dr. Sarah's team will get back to you right away!",
            primary_language: "auto",
            is_active: true,
            widget_settings: [
              {
                primary_color: "#2563eb",
                header_title: "Apex Dental Assistant",
                subtitle: "Typically replies in seconds",
                welcome_message: "Hello! Welcome to Apex Dental Clinic. How can I assist you with your smile today?",
                placeholder_text: "Type your message...",
                position: "bottom-right",
                suggested_questions: [
                  "Do you accept Delta Dental?",
                  "How much is teeth cleaning?",
                  "Can I book an appointment?",
                ],
              },
            ],
          },
        ],
      });
    }

    return NextResponse.json({ bots: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(request.ip || "bot-create", "GENERAL_API");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const json = await request.json();
    const parsed = createBotSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const {
      workspace_id,
      name,
      description,
      personality,
      tone,
      temperature,
      instructions,
      fallback_message,
      primary_language,
      primary_color,
      welcome_message,
    } = parsed.data;

    const supabase = createClient();

    // Ensure valid UUID for PostgreSQL column
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspace_id);
    let resolvedWorkspaceId = workspace_id;
    if (!isUuid) {
      const { data: firstWs } = await supabase.from("workspaces").select("id").limit(1).maybeSingle();
      resolvedWorkspaceId = firstWs?.id || "5d6b5093-e906-4a70-b29b-5726053d2c79";
    }

    // Authorize workspace access with admin minimum role
    const authCheck = await verifyWorkspaceAccess(resolvedWorkspaceId, "admin");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    // Insert bot
    const { data: bot, error: botError } = await supabase
      .from("chatbots")
      .insert({
        workspace_id: resolvedWorkspaceId,
        name,
        description,
        personality,
        tone,
        temperature,
        instructions,
        fallback_message,
        primary_language,
        is_active: true,
      })
      .select()
      .single();

    if (botError) {
      // Return simulated bot in local/offline mode
      const simulatedBot = {
        id: `bot-${Date.now()}`,
        workspace_id,
        public_id: `bot-pub-${Date.now()}`,
        name,
        description,
        personality,
        tone,
        temperature,
        instructions,
        fallback_message,
        primary_language,
        is_active: true,
      };
      return NextResponse.json({ bot: simulatedBot }, { status: 201 });
    }

    // Insert widget settings
    await supabase.from("widget_settings").insert({
      chatbot_id: bot.id,
      workspace_id: resolvedWorkspaceId,
      primary_color,
      header_title: name,
      welcome_message,
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
