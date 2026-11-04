import { NextRequest, NextResponse } from "next/server";
import { serverError } from "@/lib/http";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().default("#18181b"),
  currency: z.string().regex(/^[A-Z]{3}$/).optional().default("USD"),
  avg_job_value: z.number().min(0).max(1_000_000).optional().default(300),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
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
      return serverError(error, "workspaces", 400);
    }

    return NextResponse.json({ workspaces: data });
  } catch (err: any) {
    return serverError(err, "workspaces");
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createWorkspaceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid workspace details." }, { status: 400 });
    }

    const { name, accent_color, currency, avg_job_value } = parsed.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
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

    // Insert workspace + owner membership with the service role (after the auth check above);
    // RLS intentionally has no INSERT policy on workspaces/workspace_members for end users.
    const admin = createAdminClient();
    const { data: ws, error: wsError } = await admin
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
      return serverError(wsError, "workspaces", 400);
    }

    // Add owner membership
    await admin.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json({ workspace: ws }, { status: 201 });
  } catch (err: any) {
    return serverError(err, "workspaces");
  }
}
