import { NextRequest, NextResponse } from "next/server";
import { serverError, getClientIp } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyWorkspaceAccess, recordAuditLog } from "@/lib/auth/guard";
import { checkRateLimit } from "@/lib/security/ratelimit";

/**
 * GDPR Data Portability Export (GET)
 * Requires workspace owner role & rate limiting
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const workspaceId = params.id;

    const rateCheck = await checkRateLimit(getClientIp(request), "GENERAL_API");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const authCheck = await verifyWorkspaceAccess(workspaceId, "owner");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabase = createAdminClient();

    const [wsRes, botsRes, sourcesRes, leadsRes] = await Promise.all([
      supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
      supabase.from("chatbots").select("*").eq("workspace_id", workspaceId),
      supabase.from("training_sources").select("*").eq("workspace_id", workspaceId),
      supabase.from("leads").select("*").eq("workspace_id", workspaceId),
    ]);

    await recordAuditLog({
      workspaceId,
      userId: authCheck.user?.userId,
      action: "workspace.gdpr.export",
      resourceType: "workspace",
      resourceId: workspaceId,
    });

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
    return serverError(err, "workspaces.[id].gdpr");
  }
}

/**
 * GDPR Right to Erasure / Permanent Deletion (DELETE)
 * Requires verified workspace owner authentication
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const workspaceId = params.id;

    const rateCheck = await checkRateLimit(getClientIp(request), "GENERAL_API");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const authCheck = await verifyWorkspaceAccess(workspaceId, "owner");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabase = createAdminClient();

    await recordAuditLog({
      workspaceId,
      userId: authCheck.user?.userId,
      action: "workspace.gdpr.delete",
      resourceType: "workspace",
      resourceId: workspaceId,
    });

    // Cascades through foreign keys: deletes document_chunks, vectors, conversations, leads
    await supabase.from("workspaces").delete().eq("id", workspaceId);

    return NextResponse.json({
      ok: true,
      message: "Workspace and all associated vector embeddings permanently deleted.",
    });
  } catch (err: any) {
    return serverError(err, "workspaces.[id].gdpr");
  }
}
