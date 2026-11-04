-- =====================================================================================
-- 20261104000003 — Production lockdown
--  * Auto-create profiles for new auth users (required by workspace_members FK)
--  * Block privilege escalation via profiles (is_super_admin / MFA columns)
--  * Remove anonymous write policies (widget writes go through the server w/ service role)
--  * Stop leaking bot system prompts to the anon key
--  * Role-based (owner/admin/agent/viewer) RLS instead of "any member can do anything"
--  * Indexes for the new hot query paths
-- Idempotent: safe to re-run.
-- =====================================================================================

-- 1. Profile bootstrap trigger ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'business_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any users created before this trigger existed
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles: users may only edit harmless columns; never is_super_admin / MFA / lockout ----
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (full_name, avatar_url, updated_at) ON public.profiles TO authenticated;
-- MFA secret must never be readable from the browser (server reads it with the service role)
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, email, full_name, avatar_url, is_super_admin, mfa_enabled, created_at, updated_at)
  ON public.profiles TO authenticated;

-- 3. Role helper ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_workspace_role(ws_id UUID, min_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = ws_id
      AND wm.user_id = auth.uid()
      AND (CASE wm.role WHEN 'owner' THEN 4 WHEN 'admin' THEN 3 WHEN 'agent' THEN 2 ELSE 1 END)
          >= (CASE min_role WHEN 'owner' THEN 4 WHEN 'admin' THEN 3 WHEN 'agent' THEN 2 ELSE 1 END)
  );
$$;
REVOKE ALL ON FUNCTION public.has_workspace_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(UUID, TEXT) TO authenticated;

-- 4. Remove anonymous write paths & public prompt leakage -------------------------------
DROP POLICY IF EXISTS "Public insert conversation" ON public.conversations;
DROP POLICY IF EXISTS "Public insert message" ON public.messages;
DROP POLICY IF EXISTS "Public insert lead" ON public.leads;
DROP POLICY IF EXISTS "Public read for chatbot widget" ON public.chatbots;  -- exposed system prompts
DROP POLICY IF EXISTS "Public read widget settings" ON public.widget_settings;

-- Widget appearance is public, but only for active bots
CREATE POLICY "Public read widget settings for active bots"
ON public.widget_settings FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.chatbots c WHERE c.id = chatbot_id AND c.is_active));

-- 5. Role-based policies for core tenant tables ----------------------------------------
-- Chatbots: members read; admins write; owners delete
DROP POLICY IF EXISTS "Members can manage chatbots in their workspace" ON public.chatbots;
CREATE POLICY "chatbots_select_members" ON public.chatbots FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY "chatbots_insert_admins" ON public.chatbots FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, 'admin'));
CREATE POLICY "chatbots_update_admins" ON public.chatbots FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, 'admin'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'admin'));
CREATE POLICY "chatbots_delete_owners" ON public.chatbots FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, 'owner'));

-- Widget settings: admins write
DROP POLICY IF EXISTS "Members manage widget settings" ON public.widget_settings;
CREATE POLICY "widget_settings_write_admins" ON public.widget_settings FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, 'admin'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'admin'));

-- Training data: agents+ write, members read
DROP POLICY IF EXISTS "Members manage training sources" ON public.training_sources;
CREATE POLICY "training_sources_select" ON public.training_sources FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY "training_sources_write" ON public.training_sources FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, 'agent'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'agent'));

DROP POLICY IF EXISTS "Members view document chunks" ON public.document_chunks;
CREATE POLICY "document_chunks_select" ON public.document_chunks FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY "document_chunks_write" ON public.document_chunks FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, 'agent'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'agent'));

-- Conversations & leads: viewers read; agents act
DROP POLICY IF EXISTS "Members view conversations" ON public.conversations;
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY "conversations_write" ON public.conversations FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, 'agent'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'agent'));

CREATE POLICY "messages_agent_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND public.has_workspace_role(c.workspace_id, 'agent')
  ));

DROP POLICY IF EXISTS "Members manage leads" ON public.leads;
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, 'agent'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'agent'));
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
  USING (public.has_workspace_role(workspace_id, 'admin'));

-- Workspace membership management: owners only
CREATE POLICY "workspace_members_owner_manage" ON public.workspace_members FOR ALL TO authenticated
  USING (public.has_workspace_role(workspace_id, 'owner'))
  WITH CHECK (public.has_workspace_role(workspace_id, 'owner'));

-- Workspace deletion: owners only (suspension flag is server/admin only)
CREATE POLICY "workspaces_delete_owner" ON public.workspaces FOR DELETE TO authenticated
  USING (public.has_workspace_role(id, 'owner'));
-- (column-level REVOKE cannot override a table-level grant, so re-grant only safe columns)
REVOKE UPDATE ON public.workspaces FROM authenticated, anon;
GRANT UPDATE (name, logo_url, accent_color, currency, avg_job_value, custom_domain, updated_at)
  ON public.workspaces TO authenticated;

-- 6. Indexes for hot paths ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_conversations_bot_session ON public.conversations (chatbot_id, session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_updated ON public.conversations (workspace_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_conversation ON public.leads (conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_workspace_status ON public.leads (workspace_id, qualification_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON public.messages (conversation_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin ON public.profiles (id) WHERE is_super_admin;
