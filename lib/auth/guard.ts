/**
 * Server-Side Access Control & Broken Object Level Authorization (BOLA) Guard
 * Validates authentication on every request and ensures users only access resources they own.
 */

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export type WorkspaceRole = "owner" | "admin" | "agent" | "viewer";

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  agent: 2,
  admin: 3,
  owner: 4,
};

export interface AuthContext {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
}

/**
 * Retrieves the currently authenticated user from server session cookies.
 * In development mode with placeholder credentials, safely provides simulated demo session.
 */
export async function getAuthenticatedUser(): Promise<AuthContext | null> {
  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      // Check if super admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();

      return {
        userId: user.id,
        email: user.email || "",
        isSuperAdmin: !!profile?.is_super_admin,
      };
    }

    if (process.env.NODE_ENV === "development" && isPlaceholderSupabase) {
      return {
        userId: "usr-demo-001",
        email: "demo@chatify.ai",
        isSuperAdmin: true,
      };
    }

    return null;
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isPlaceholderSupabase) {
      return {
        userId: "usr-demo-001",
        email: "demo@chatify.ai",
        isSuperAdmin: true,
      };
    }
    return null;
  }
}

/**
 * BOLA / IDOR Protection: Verifies user belongs to the requested workspace with minimum role.
 */
export async function verifyWorkspaceAccess(
  workspaceId: string,
  minRole: WorkspaceRole = "viewer"
): Promise<{ allowed: boolean; role?: WorkspaceRole; user?: AuthContext; error?: string }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { allowed: false, error: "Unauthorized: Active session required." };
  }

  // Super-admin has global oversight access
  if (user.isSuperAdmin) {
    return { allowed: true, role: "owner", user };
  }

  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (process.env.NODE_ENV === "development" && isPlaceholderSupabase) {
    return { allowed: true, role: "owner", user };
  }

  const supabase = createClient();
  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.userId)
    .single();

  if (error || !membership) {
    logger.warn("BOLA authorization violation attempt", {
      userId: user.userId,
      workspaceId,
      minRole,
    });
    return { allowed: false, error: "Forbidden: You do not have permission to access this workspace." };
  }

  const userRoleRank = ROLE_HIERARCHY[membership.role as WorkspaceRole] || 0;
  const requiredRoleRank = ROLE_HIERARCHY[minRole];

  if (userRoleRank < requiredRoleRank) {
    return {
      allowed: false,
      error: `Forbidden: Action requires '${minRole}' role or higher (you have '${membership.role}').`,
    };
  }

  return { allowed: true, role: membership.role as WorkspaceRole, user };
}

/**
 * BOLA / IDOR Protection: Verifies that the requesting user owns the chatbot's parent workspace.
 */
export async function verifyBotOwnership(
  botId: string,
  minRole: WorkspaceRole = "agent"
): Promise<{ allowed: boolean; bot?: any; error?: string; user?: AuthContext }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { allowed: false, error: "Unauthorized: Active session required." };
  }

  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (process.env.NODE_ENV === "development" && isPlaceholderSupabase) {
    return { allowed: true, user };
  }

  const supabase = createClient();
  const { data: bot, error: botError } = await supabase
    .from("chatbots")
    .select("*, widget_settings(*)")
    .eq("id", botId)
    .single();

  if (botError || !bot) {
    return { allowed: false, error: "Bot not found." };
  }

  const access = await verifyWorkspaceAccess(bot.workspace_id, minRole);
  if (!access.allowed) {
    return { allowed: false, error: access.error };
  }

  return { allowed: true, bot, user };
}

/**
 * Super Admin Lockdown: Verifies user has super-admin privileges.
 */
export async function verifySuperAdmin(): Promise<{ allowed: boolean; user?: AuthContext; error?: string }> {
  const user = await getAuthenticatedUser();
  if (!user || !user.isSuperAdmin) {
    logger.warn("Unauthorized admin route access attempt", { user: user?.userId });
    return { allowed: false, error: "Forbidden: Super Administrator access required." };
  }
  return { allowed: true, user };
}

/**
 * Records an audit log entry in the database.
 */
export async function recordAuditLog(entry: {
  workspaceId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}) {
  try {
    logger.audit(entry.action, {
      userId: entry.userId,
      workspaceId: entry.workspaceId,
      resource: `${entry.resourceType}:${entry.resourceId || ""}`,
      status: "success",
    });

    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      workspace_id: entry.workspaceId || null,
      user_id: entry.userId || null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      ip_address: entry.ipAddress || null,
      metadata: entry.metadata || {},
    });
  } catch {
    // Non-blocking for audit logging
  }
}
