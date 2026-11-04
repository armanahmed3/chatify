/**
 * Resolves a public widget bot and enforces object-level authorization for anonymous widget traffic.
 * Anonymous visitors only ever touch rows that belong to the bot whose public_id they hold, and only
 * conversations whose session_id they know.
 */
import { createAdminClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

export interface PublicBot {
  id: string;
  workspace_id: string;
}

export async function resolvePublicBot(publicId: string): Promise<PublicBot | null> {
  if (!isUuid(publicId)) return null;
  const db = createAdminClient();
  const { data } = await db
    .from("chatbots")
    .select("id, workspace_id, is_active")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data || data.is_active === false) return null;
  return { id: data.id, workspace_id: data.workspace_id };
}

/** True only if the conversation belongs to this bot AND was started by this widget session. */
export async function conversationBelongsTo(
  conversationId: string,
  bot: PublicBot,
  sessionId: string
): Promise<boolean> {
  if (!isUuid(conversationId)) return false;
  const db = createAdminClient();
  const { data } = await db
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("chatbot_id", bot.id)
    .eq("session_id", sessionId)
    .maybeSingle();
  return !!data;
}

/** Demo bots (e.g. "demo-apex") are only served outside production. */
export const allowDemoBots = () => process.env.NODE_ENV !== "production";
