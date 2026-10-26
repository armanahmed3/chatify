import crypto from "crypto";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  accent_color?: string;
  currency?: string;
  avg_job_value?: number;
  custom_domain?: string | null;
  custom_domain_verified?: boolean;
  white_label_enabled?: boolean;
  is_suspended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  role: "admin" | "user";
  workspaces: Workspace[];
  activeWorkspaceId: string;
  createdAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. Pre-configured Administrator Account
const adminSalt = "chatify_admin_secure_salt_2026";
const ADMIN_USER: UserAccount = {
  id: "usr-admin-001",
  email: "admin@chatify.ai",
  name: "System Administrator",
  phone: "+1 (800) 555-0199",
  salt: adminSalt,
  passwordHash: hashPassword("AdminSecure2026!", adminSalt),
  role: "admin",
  activeWorkspaceId: "ws-admin-hq",
  workspaces: [
    {
      id: "ws-admin-hq",
      name: "Chatify Enterprise HQ",
      slug: "chatify-enterprise",
      logo_url: null,
      accent_color: "#6366f1",
      currency: "USD",
      avg_job_value: 1200.0,
      custom_domain: "admin.chatify.ai",
      custom_domain_verified: true,
      white_label_enabled: true,
      is_suspended: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "ws-admin-sandbox",
      name: "Global Operations Hub",
      slug: "global-operations",
      logo_url: null,
      accent_color: "#0ea5e9",
      currency: "USD",
      avg_job_value: 850.0,
      custom_domain: null,
      custom_domain_verified: false,
      white_label_enabled: true,
      is_suspended: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
  createdAt: "2026-01-01T00:00:00Z",
};

// 2. Pre-configured Standard User Account
const userSalt = "chatify_user_secure_salt_2026";
const STANDARD_USER: UserAccount = {
  id: "usr-standard-002",
  email: "user@chatify.ai",
  name: "Nova Agency Manager",
  phone: "+1 (555) 789-2041",
  salt: userSalt,
  passwordHash: hashPassword("UserPass2026!", userSalt),
  role: "user",
  activeWorkspaceId: "ws-nova-agency",
  workspaces: [
    {
      id: "ws-nova-agency",
      name: "Nova Marketing Agency",
      slug: "nova-agency",
      logo_url: null,
      accent_color: "#10b981",
      currency: "USD",
      avg_job_value: 650.0,
      custom_domain: null,
      custom_domain_verified: false,
      white_label_enabled: false,
      is_suspended: false,
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    },
  ],
  createdAt: "2026-02-15T00:00:00Z",
};

// In-Memory Durable Store for Runtime Users
const userStore = new Map<string, UserAccount>();

// Seed default users
userStore.set(ADMIN_USER.email.toLowerCase(), ADMIN_USER);
userStore.set(STANDARD_USER.email.toLowerCase(), STANDARD_USER);

/**
 * Registers a new user with their own dedicated business workspace
 */
export function registerUser(params: {
  email: string;
  phone: string;
  businessName: string;
  password: string;
}): { user: UserAccount; workspace: Workspace } {
  const normalizedEmail = params.email.trim().toLowerCase();
  const salt = generateSalt();
  const passwordHash = hashPassword(params.password, salt);

  const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const slug = slugify(params.businessName) || `biz-${Date.now()}`;

  const newWorkspace: Workspace = {
    id: workspaceId,
    name: params.businessName.trim(),
    slug,
    logo_url: null,
    accent_color: "#2563eb",
    currency: "USD",
    avg_job_value: 400.0,
    custom_domain: null,
    custom_domain_verified: false,
    white_label_enabled: false,
    is_suspended: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const newUser: UserAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: normalizedEmail,
    name: params.businessName.trim(),
    phone: params.phone.trim(),
    salt,
    passwordHash,
    role: "user",
    activeWorkspaceId: workspaceId,
    workspaces: [newWorkspace],
    createdAt: new Date().toISOString(),
  };

  userStore.set(normalizedEmail, newUser);

  return { user: newUser, workspace: newWorkspace };
}

/**
 * Authenticates user credentials and returns user with their workspaces
 */
export function authenticateUser(
  email: string,
  plainPassword: string
): { success: boolean; user?: UserAccount; workspace?: Workspace; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const computedHash = hashPassword(plainPassword, user.salt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: "Invalid email or password." };
  }

  const activeWs =
    user.workspaces.find((w) => w.id === user.activeWorkspaceId) || user.workspaces[0];

  return {
    success: true,
    user,
    workspace: activeWs,
  };
}

/**
 * Retrieves a user by email
 */
export function getUserByEmail(email: string): UserAccount | undefined {
  return userStore.get(email.trim().toLowerCase());
}

/**
 * Creates an additional workspace for an existing user (Multi-Dashboard)
 */
export function addWorkspaceToUser(
  email: string,
  businessName: string
): Workspace | null {
  const user = userStore.get(email.trim().toLowerCase());
  if (!user) return null;

  const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const slug = slugify(businessName) || `practice-${Date.now()}`;

  const ws: Workspace = {
    id: workspaceId,
    name: businessName.trim(),
    slug,
    logo_url: null,
    accent_color: "#2563eb",
    currency: "USD",
    avg_job_value: 350.0,
    custom_domain: null,
    custom_domain_verified: false,
    white_label_enabled: false,
    is_suspended: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  user.workspaces.push(ws);
  user.activeWorkspaceId = ws.id;
  return ws;
}
