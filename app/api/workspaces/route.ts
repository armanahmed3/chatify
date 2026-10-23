import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  accent_color: z.string().optional().default("#18181b"),
  currency: z.string().optional().default("USD"),
  avg_job_value: z.number().optional().default(300),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // In development fallback without live Supabase session
      return NextResponse.json({
        workspaces: [
          {
            id: "ws-demo-001",
            name: "Apex Dental Clinic",
            slug: "apex-dental",
            accent_color: "#2563eb",
            currency: "USD",
            avg_job_value: 350,
          },
        ],
      });
    }

    const { data, error } = await supabase
      .from("workspaces")
      .select("*, workspace_members!inner(role)")
      .eq("workspace_members.user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ workspaces: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createWorkspaceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { name, accent_color, currency, avg_job_value } = parsed.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        workspace: {
          id: `ws-${Date.now()}`,
          name,
          slug,
          accent_color,
          currency,
          avg_job_value,
        },
      });
    }

    // Insert workspace
    const { data: ws, error: wsError } = await supabase
      .from("workspaces")
      .insert({
        name,
        slug,
        accent_color,
        currency,
        avg_job_value,
      })
      .select()
      .single();

    if (wsError) {
      return NextResponse.json({ error: wsError.message }, { status: 400 });
    }

    // Add owner membership
    await supabase.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json({ workspace: ws }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
