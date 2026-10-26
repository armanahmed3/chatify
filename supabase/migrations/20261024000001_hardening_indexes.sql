-- ==============================================================================
-- CHATIFY PRODUCTION HARDENING & PERFORMANCE INDEXES MIGRATION
-- Migration: 20261024000001_hardening_indexes.sql
-- ==============================================================================

-- 1. SECURITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners and admins view audit logs"
ON public.audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = audit_logs.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "System insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (TRUE);

-- 2. MFA ENHANCEMENTS ON PROFILES
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'mfa_enabled'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.profiles ADD COLUMN mfa_secret TEXT;
        ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMPTZ;
        ALTER TABLE public.profiles ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
        ALTER TABLE public.profiles ADD COLUMN locked_until TIMESTAMPTZ;
    END IF;
END $$;

-- 3. HIGH-PERFORMANCE DATABASE INDEXES (B-TREE & COMPOSITE)

-- Chatbots & Workspace lookups
CREATE INDEX IF NOT EXISTS idx_chatbots_workspace_id ON public.chatbots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_public_id ON public.chatbots(public_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_active ON public.chatbots(is_active) WHERE is_active = TRUE;

-- Widget settings lookup
CREATE INDEX IF NOT EXISTS idx_widget_settings_chatbot_id ON public.widget_settings(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_widget_settings_workspace_id ON public.widget_settings(workspace_id);

-- Workspace members (Auth & Authorization queries on every request)
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_composite ON public.workspace_members(workspace_id, user_id, role);

-- Training Sources & Document Chunks (RAG ingest and lookup)
CREATE INDEX IF NOT EXISTS idx_training_sources_bot_status ON public.training_sources(chatbot_id, status);
CREATE INDEX IF NOT EXISTS idx_training_sources_workspace_id ON public.training_sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_bot_id ON public.document_chunks(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_source_id ON public.document_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_priority ON public.document_chunks(priority);

-- Vector HNSW / IVFFLAT Index on document_chunks (embedding) for sub-5ms semantic vector similarity search
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
        ON public.document_chunks USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_ivfflat 
        ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
END $$;

-- Conversations & Messages (High throughput chat streaming)
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_bot ON public.conversations(workspace_id, chatbot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at_desc ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_visitor_token ON public.conversations(visitor_token);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON public.messages(sender_type);

-- Leads & CRM Queries
CREATE INDEX IF NOT EXISTS idx_leads_workspace_score ON public.leads(workspace_id, score);
CREATE INDEX IF NOT EXISTS idx_leads_qualification ON public.leads(qualification_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);

-- Actions & Workflow Rules
CREATE INDEX IF NOT EXISTS idx_actions_bot_active ON public.actions(chatbot_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_bot_event ON public.workflow_rules(chatbot_id, trigger_event, is_active);

-- Subscriptions & Billing
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON public.subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Security Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_created ON public.audit_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
