-- ==============================================================================
-- CHATIFY ENTERPRISE SUPABASE SECURITY HARDENING & RLS POLICY ENFORCEMENT
-- Migration: 20261025000002_security_hardening.sql
-- ==============================================================================

-- 1. HARDEN SECURITY DEFINER FUNCTION WITH SEARCH PATH PROTECTION
-- Prevents search_path hijacking in helper function
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
          AND user_id = auth.uid()
    );
END;
$$;

-- Restrict function execution rights
REVOKE ALL ON FUNCTION public.is_workspace_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID) TO authenticated, anon;

-- 2. ENFORCE 'FORCE ROW LEVEL SECURITY' ACROSS ALL 19 SENSITIVE TABLES
-- Ensures table owners and non-superusers cannot accidentally bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots FORCE ROW LEVEL SECURITY;
ALTER TABLE public.widget_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.training_sources FORCE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.actions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.action_runs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_ai_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.templates FORCE ROW LEVEL SECURITY;

-- 3. STORAGE BUCKET RLS POLICIES FOR STORAGE.OBJECTS
-- A. 'workspace-assets' bucket (Public view, member write)
CREATE POLICY "Public read for workspace assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-assets');

CREATE POLICY "Authenticated users upload workspace assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'workspace-assets' 
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.workspaces 
        WHERE public.is_workspace_member(id)
    )
);

-- B. 'training-documents' bucket (Strictly private tenant isolation)
CREATE POLICY "Members view private training documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'training-documents'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.workspaces 
        WHERE public.is_workspace_member(id)
    )
);

CREATE POLICY "Members upload private training documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'training-documents'
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.workspaces 
        WHERE public.is_workspace_member(id)
    )
);

CREATE POLICY "Owners and admins delete private training documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'training-documents'
    AND (storage.foldername(name))[1] IN (
        SELECT wm.workspace_id::text 
        FROM public.workspace_members wm
        WHERE wm.user_id = auth.uid() 
          AND wm.role IN ('owner', 'admin')
    )
);

-- 4. HARDEN OBJECT-LEVEL GRANTS AGAINST EXCESSIVE PRIVILEGES
-- Sensitive operational tables should never be directly writable by anon or authenticated
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.subscriptions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.workspace_ai_keys FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.api_keys FROM anon;
