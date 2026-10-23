-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    accent_color TEXT DEFAULT '#18181b',
    currency TEXT DEFAULT 'USD',
    avg_job_value NUMERIC(10, 2) DEFAULT 300.00,
    custom_domain TEXT UNIQUE,
    custom_domain_verified BOOLEAN DEFAULT FALSE,
    white_label_enabled BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 4. CHATBOTS TABLE
CREATE TABLE IF NOT EXISTS public.chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    public_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    personality TEXT DEFAULT 'helpful, professional, and concise',
    tone TEXT DEFAULT 'friendly',
    temperature NUMERIC(2, 1) DEFAULT 0.3,
    instructions TEXT DEFAULT 'You are a helpful customer service assistant for our business. Answer questions accurately based on our knowledge base. Never invent prices or services.',
    fallback_message TEXT DEFAULT 'I don''t have the exact details on that right now. Please leave your contact information and our team will get right back to you!',
    primary_language TEXT DEFAULT 'auto',
    is_active BOOLEAN DEFAULT TRUE,
    allowed_domains TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WIDGET SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.widget_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID UNIQUE NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    primary_color TEXT DEFAULT '#18181b',
    header_title TEXT DEFAULT 'Customer Support',
    subtitle TEXT DEFAULT 'Typically replies in seconds',
    welcome_message TEXT DEFAULT 'Hi there! 👋 How can we help you today?',
    placeholder_text TEXT DEFAULT 'Type your message...',
    position TEXT DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left')),
    launcher_icon TEXT DEFAULT 'message-circle',
    show_branding BOOLEAN DEFAULT TRUE,
    auto_open_delay_sec INTEGER DEFAULT 0,
    suggested_questions JSONB DEFAULT '["What are your hours?", "Where are you located?", "How can I book an appointment?"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRAINING SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.training_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('website', 'text', 'qa', 'file', 'social', 'youtube', 'notion')),
    title TEXT NOT NULL,
    url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'indexing', 'ready', 'failed')),
    total_characters INTEGER DEFAULT 0,
    error_message TEXT,
    auto_sync_interval TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DOCUMENT CHUNKS TABLE WITH VECTOR
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.training_sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(768),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Vector Cosine Search (HNSW)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_document_chunks_bot 
ON public.document_chunks (chatbot_id);

-- 8. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp', 'instagram', 'messenger')),
    session_id TEXT NOT NULL,
    user_ip TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'human_takeover', 'resolved')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    internal_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_workspace_bot 
ON public.conversations(workspace_id, chatbot_id);

-- 9. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot', 'agent', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(3, 2),
    sentiment TEXT,
    intent TEXT,
    feedback TEXT CHECK (feedback IN ('up', 'down', NULL)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages(conversation_id, created_at);

-- 10. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    requirements TEXT,
    score TEXT DEFAULT 'warm' CHECK (score IN ('hot', 'warm', 'cold')),
    qualification_status TEXT DEFAULT 'new' CHECK (qualification_status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_workspace 
ON public.leads(workspace_id, created_at DESC);

-- 11. ACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('appointment', 'webhook', 'email', 'coupon', 'product_card')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ACTION RUNS TABLE
CREATE TABLE IF NOT EXISTS public.action_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    input_payload JSONB NOT NULL,
    output_payload JSONB,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WORKFLOW RULES TABLE
CREATE TABLE IF NOT EXISTS public.workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'intent', 'first_message', 'after_hours')),
    trigger_condition JSONB NOT NULL DEFAULT '{}'::jsonb,
    action_type TEXT NOT NULL CHECK (action_type IN ('lead_form', 'coupon', 'human_handover', 'fixed_answer', 'tag')),
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'pro', 'agency')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. USAGE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE SET NULL,
    query_type TEXT NOT NULL CHECK (query_type IN ('exact_qa', 'semantic_cache', 'rag_llm')),
    provider_used TEXT,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    was_llm_call BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_billing 
ON public.usage_logs(workspace_id, created_at, was_llm_call);

-- 16. API KEYS TABLE
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    scopes TEXT[] DEFAULT '{read,write}',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. WORKSPACE AI KEYS (BYOK Optional)
CREATE TABLE IF NOT EXISTS public.workspace_ai_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, provider)
);

-- 18. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. INDUSTRY TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    personality TEXT NOT NULL,
    instructions TEXT NOT NULL,
    suggested_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    sample_qa JSONB NOT NULL DEFAULT '[]'::jsonb,
    lead_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_ai_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policy
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Workspaces Policy
CREATE POLICY "Members can view their workspaces"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(id));

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Workspace Members Policy
CREATE POLICY "Members can view co-members"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id));

-- Chatbots Policy
CREATE POLICY "Members can manage chatbots in their workspace"
ON public.chatbots FOR ALL
USING (public.is_workspace_member(workspace_id));

-- Public read for active chatbots via public_id
CREATE POLICY "Public read for chatbot widget"
ON public.chatbots FOR SELECT
USING (is_active = TRUE);

-- Widget Settings Policy
CREATE POLICY "Members manage widget settings"
ON public.widget_settings FOR ALL
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Public read widget settings"
ON public.widget_settings FOR SELECT
USING (TRUE);

-- Training Sources Policy
CREATE POLICY "Members manage training sources"
ON public.training_sources FOR ALL
USING (public.is_workspace_member(workspace_id));

-- Document Chunks Policy
CREATE POLICY "Members view document chunks"
ON public.document_chunks FOR ALL
USING (public.is_workspace_member(workspace_id));

-- Conversations Policy
CREATE POLICY "Members view conversations"
ON public.conversations FOR ALL
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Public insert conversation"
ON public.conversations FOR INSERT
WITH CHECK (TRUE);

-- Messages Policy
CREATE POLICY "Members view messages"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id AND public.is_workspace_member(c.workspace_id)
    )
);

CREATE POLICY "Public insert message"
ON public.messages FOR INSERT
WITH CHECK (TRUE);

-- Leads Policy
CREATE POLICY "Members manage leads"
ON public.leads FOR ALL
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Public insert lead"
ON public.leads FOR INSERT
WITH CHECK (TRUE);

-- Actions Policy
CREATE POLICY "Members manage actions"
ON public.actions FOR ALL
USING (public.is_workspace_member(workspace_id));

-- Workflow Rules Policy
CREATE POLICY "Members manage workflows"
ON public.workflow_rules FOR ALL
USING (public.is_workspace_member(workspace_id));

-- Subscriptions Policy
CREATE POLICY "Members view subscriptions"
ON public.subscriptions FOR SELECT
USING (public.is_workspace_member(workspace_id));

-- Templates Policy (Public Read)
CREATE POLICY "All users view templates"
ON public.templates FOR SELECT
USING (TRUE);

-- Storage bucket configuration for files and logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('workspace-assets', 'workspace-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-documents', 'training-documents', false)
ON CONFLICT (id) DO NOTHING;
