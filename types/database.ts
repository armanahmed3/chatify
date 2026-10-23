export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  currency: string;
  avg_job_value: number;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  white_label_enabled: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "owner" | "admin" | "agent" | "viewer";
  created_at: string;
  profile?: Profile;
}

export interface Chatbot {
  id: string;
  workspace_id: string;
  public_id: string;
  name: string;
  description: string | null;
  personality: string;
  tone: string;
  temperature: number;
  instructions: string;
  fallback_message: string;
  primary_language: string;
  is_active: boolean;
  allowed_domains: string[];
  created_at: string;
  updated_at: string;
}

export interface WidgetSettings {
  id: string;
  chatbot_id: string;
  workspace_id: string;
  primary_color: string;
  header_title: string;
  subtitle: string;
  welcome_message: string;
  placeholder_text: string;
  position: "bottom-right" | "bottom-left";
  launcher_icon: string;
  show_branding: boolean;
  auto_open_delay_sec: number;
  suggested_questions: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingSource {
  id: string;
  workspace_id: string;
  chatbot_id: string;
  source_type: "website" | "text" | "qa" | "file" | "social" | "youtube" | "notion";
  title: string;
  url: string | null;
  status: "pending" | "indexing" | "ready" | "failed";
  total_characters: number;
  error_message: string | null;
  auto_sync_interval: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  workspace_id: string;
  chatbot_id: string;
  source_id: string;
  content: string;
  embedding?: number[];
  priority: "normal" | "high";
  metadata: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  workspace_id: string;
  chatbot_id: string;
  channel: "web" | "whatsapp" | "instagram" | "messenger";
  session_id: string;
  user_ip: string | null;
  status: "active" | "human_takeover" | "resolved";
  assigned_to: string | null;
  internal_notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  chatbot?: Chatbot;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: "user" | "bot" | "agent" | "system";
  content: string;
  citations: Array<{ title: string; url?: string; snippet?: string }>;
  confidence_score: number | null;
  sentiment: "positive" | "neutral" | "negative" | "angry" | null;
  intent: "sales" | "support" | "booking" | "complaint" | "general" | null;
  feedback: "up" | "down" | null;
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  chatbot_id: string;
  conversation_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  requirements: string | null;
  score: "hot" | "warm" | "cold";
  qualification_status: "new" | "contacted" | "qualified" | "won" | "lost";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  workspace_id: string;
  chatbot_id: string;
  action_type: "appointment" | "webhook" | "email" | "coupon" | "product_card";
  name: string;
  description: string;
  configuration: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
}

export interface WorkflowRule {
  id: string;
  workspace_id: string;
  chatbot_id: string;
  name: string;
  trigger_type: "keyword" | "intent" | "first_message" | "after_hours";
  trigger_condition: Record<string, any>;
  action_type: "lead_form" | "coupon" | "human_handover" | "fixed_answer" | "tag";
  action_payload: Record<string, any>;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_tier: "free" | "starter" | "pro" | "agency";
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  workspace_id: string;
  chatbot_id: string | null;
  query_type: "exact_qa" | "semantic_cache" | "rag_llm";
  provider_used: string | null;
  input_tokens: number;
  output_tokens: number;
  was_llm_call: boolean;
  created_at: string;
}
