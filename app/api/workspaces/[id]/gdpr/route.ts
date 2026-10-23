import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server.ts";

/**
 * GDPR Data Portability Export (GET)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = params.id;
    const supabase = createAdminClient();

    const [wsRes, botsRes, sourcesRes, leadsRes] = await Promise.all([
      supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
      supabase.from("chatbots").select("*").eq("workspace_id", workspaceId),
      supabase.from("training_sources").select("*").eq("workspace_id", workspaceId),
      supabase.from("leads").select("*").eq("workspace_id", workspaceId),
    ]);

    const exportPayload = {
      gdpr_compliance: "Full Data Export Article 20 GDPR",
      exported_at: new Date().toISOString(),
      workspace: wsRes.data,
      chatbots: botsRes.data,
      training_sources: sourcesRes.data,
      leads: leadsRes.data,
    };

    return NextResponse.json(exportPayload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GDPR Right to Erasure / Permanent Deletion (DELETE)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = params.id;
    const supabase = createAdminClient();

    // Cascades through foreign keys: deletes document_chunks, vectors, conversations, leads
    await supabase.from("workspaces").delete().eq("id", workspaceId);

    return NextResponse.json({
      ok: true,
      message: "Workspace and all associated vector embeddings permanently deleted.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
