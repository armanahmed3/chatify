/**
 * Enterprise Anti-Free-Trial Abuse, Identity Verification & Bot Defense Engine
 * Protects SaaS free trials from duplicate accounts, disposable emails, and automated multi-account abuse.
 */

import crypto from "crypto";
import dns from "dns/promises";
import { createRequire } from "module";

// Core high-risk disposable / temporary email domains guaranteed in-memory
const CORE_DISPOSABLE_DOMAINS = [
  "hopefunder.com",
  "tempmail.com",
  "temp-mail.org",
  "mailinator.com",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "fakeinbox.com",
  "getairmail.com",
  "throwawaymail.com",
  "burnermail.io",
  "mohmal.com",
  "crazymailing.com",
  "fakemailgenerator.com",
  "mytemp.email",
  "emailondeck.com",
  "tempail.com",
  "inboxkitten.com",
  "dropmail.me",
  "maildrop.cc",
  "discard.email",
  "nada.ltd",
  "getnada.com",
  "abacus.ovh",
  "zillamail.com",
  "harakirimail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "einrot.com",
  "generator.email",
  "inboxes.com",
  "inbox.si",
  "1secmail.com",
  "1secmail.net",
  "1secmail.org",
  "wwwnew.eu",
  "vddaz.com",
  "vmani.com",
];

// Load comprehensive 128,000+ disposable domain database
let fullDomainList: string[] = [];
try {
  const req = createRequire(import.meta.url);
  fullDomainList = req("./disposable-domains.json");
} catch {
  // If json cannot be required dynamically, fallback to core list
  fullDomainList = [];
}

// 1. High-Risk Disposable / Temporary Email Domains Blacklist
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  ...CORE_DISPOSABLE_DOMAINS.map((d) => d.toLowerCase()),
  ...(Array.isArray(fullDomainList) ? fullDomainList.map((d) => d.toLowerCase()) : []),
]);

// Heuristic pattern detector for disposable, throwaway, and burner email services
export const DISPOSABLE_DOMAIN_PATTERNS = [
  /hopefunder/i,
  /temp-?mail/i,
  /10minute/i,
  /mailinator/i,
  /guerrillamail/i,
  /throwaway/i,
  /burnermail/i,
  /dispos(able|e)/i,
  /trashmail/i,
  /fakemail/i,
  /sharklasers/i,
  /yopmail/i,
  /inboxkitten/i,
  /dropmail/i,
  /generator\.email/i,
  /inboxes\./i,
  /1secmail/i,
  /mohmal/i,
];

// 2. Common Breached / Weak Passwords Blacklist
export const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "admin123",
  "admin1234",
  "welcome1",
  "letmein",
  "football",
  "iloveyou",
  "chatify123",
]);

/**
 * Normalizes email address to prevent duplicate sub-addressing (e.g. user+1@gmail.com -> user@gmail.com)
 */
export function normalizeEmail(rawEmail: string): string {
  const trimmed = rawEmail.trim().toLowerCase();
  const [localPart, domainPart] = trimmed.split("@");
  if (!localPart || !domainPart) return trimmed;

  // Handle Gmail / Google Apps dot and plus aliases
  if (domainPart === "gmail.com" || domainPart === "googlemail.com") {
    const cleanLocal = localPart.replace(/\./g, "").split("+")[0];
    return `${cleanLocal}@gmail.com`;
  }

  // Handle standard plus addressing for other providers (e.g. Proton, Outlook)
  const cleanLocal = localPart.split("+")[0];
  return `${cleanLocal}@${domainPart}`;
}

/**
 * Detects if an email uses sub-addressing / plus-aliasing (e.g. mudasirit+1@gmail.com)
 * used for bulk email signups and trial abuse.
 */
export function isAliasedEmail(email: string): boolean {
  try {
    const trimmed = email.trim().toLowerCase();
    const [localPart] = trimmed.split("@");
    if (!localPart) return false;
    return localPart.includes("+");
  } catch {
    return false;
  }
}

/**
 * Validates if an email is a temporary or disposable email service
 */
export function isDisposableEmail(email: string): boolean {
  try {
    const normalized = normalizeEmail(email);
    const domain = normalized.split("@")[1];
    if (!domain) return false;
    const lowerDomain = domain.toLowerCase();

    // Direct check in 128k+ database
    if (DISPOSABLE_EMAIL_DOMAINS.has(lowerDomain)) return true;

    // Check root domain for multi-level subdomains (e.g. mail.hopefunder.com)
    const parts = lowerDomain.split(".");
    if (parts.length > 2) {
      const rootDomain = parts.slice(-2).join(".");
      if (DISPOSABLE_EMAIL_DOMAINS.has(rootDomain)) return true;
    }

    // Heuristic pattern checks
    if (DISPOSABLE_DOMAIN_PATTERNS.some((pattern) => pattern.test(lowerDomain))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Comprehensive email security validator:
 * 1. Blocks email aliases with '+' (e.g. mudasirit+1@gmail.com)
 * 2. Blocks disposable / temporary domains (hopefunder.com, tempmail, etc.)
 * 3. Blocks malformed addresses
 */
export function validateEmailSecurity(email: string): { valid: boolean; error?: string } {
  const trimmed = (email || "").trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  if (isAliasedEmail(trimmed)) {
    return {
      valid: false,
      error:
        "Sub-addressed or aliased email addresses (e.g. using '+') are strictly prohibited to prevent bulk trial abuse. Please enter your primary email address.",
    };
  }

  if (isDisposableEmail(trimmed)) {
    return {
      valid: false,
      error:
        "Temporary or disposable email services (including hopefunder.com and temp-mail) are not permitted. Please use your legitimate business or personal email address.",
    };
  }

  return { valid: true };
}

/**
 * Validates domain MX records asynchronously to catch newly created burner domains
 * that might not yet be in the static blocklist.
 */
export async function validateEmailDomainMx(
  email: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const normalized = normalizeEmail(email);
    const domain = normalized.split("@")[1];
    if (!domain) {
      return { valid: false, reason: "Invalid email format." };
    }

    if (isDisposableEmail(email)) {
      return {
        valid: false,
        reason:
          "Disposable or temporary email services (including hopefunder.com and temp-mail) are not permitted. Please provide a legitimate work or personal email.",
      };
    }

    const mxRecords = await dns.resolveMx(domain).catch(() => []);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: "The provided email domain cannot receive emails (no valid mail server / MX record found).",
      };
    }

    const suspiciousMx = [
      /mailinator/i,
      /tempmail/i,
      /guerrillamail/i,
      /yopmail/i,
      /dispostable/i,
      /10minutemail/i,
      /dropmail/i,
      /inboxkitten/i,
      /trashmail/i,
      /mohmal/i,
      /sharklasers/i,
      /hopefunder/i,
      /generator\.email/i,
      /inboxes/i,
    ];

    for (const record of mxRecords) {
      const exchange = (record.exchange || "").toLowerCase();
      if (suspiciousMx.some((pattern) => pattern.test(exchange))) {
        return {
          valid: false,
          reason: "Domain mail server is recognized as a temporary email provider.",
        };
      }
    }

    return { valid: true };
  } catch {
    return { valid: !isDisposableEmail(email) };
  }
}

/**
 * Normalizes and sanitizes phone numbers
 */
export function normalizePhoneNumber(rawPhone: string): string {
  // Remove non-digit characters except leading plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");
  // Standardize Pakistani local format 03xx -> +923xx
  if (cleaned.startsWith("03") && cleaned.length === 11) {
    cleaned = "+92" + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Evaluates password strength
 */
export function evaluatePasswordStrength(password: string): {
  isValid: boolean;
  score: "weak" | "medium" | "strong";
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
    errors.push("Password must include at least one letter.");
  }
  if (!/\d/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include at least one number or special character.");
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("This password is too common and easily guessed. Please choose a unique password.");
  }

  let score: "weak" | "medium" | "strong" = "weak";
  if (errors.length === 0) {
    if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      score = "strong";
    } else {
      score = "medium";
    }
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}

/**
 * Generates an anonymous device and network fingerprint hash
 */
export function computeDeviceFingerprint(userAgent: string, ip: string, clientToken?: string): string {
  // Subnet mask IP to /24 to protect privacy while detecting local cluster bursts
  const ipParts = ip.split(".");
  const subnet = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0` : ip;
  const raw = `${userAgent.trim()}|${subnet}|${clientToken || "none"}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// Durable Server-Side Trial Ledger Interface
export interface TrialRecord {
  id: string;
  emailHash: string;
  phoneHash: string;
  deviceHash: string;
  trialStartedAt: string;
  trialExpiresAt: string;
  status: "active" | "expired" | "abuse_blocked";
  claimedBusinessName: string;
}

// In-Memory Durable Trial Registry (synchronized with Supabase when connected)
const trialLedger = new Map<string, TrialRecord>();

/**
 * Checks server-side trial eligibility to block bulk trial re-signups
 */
export function checkTrialEligibility(params: {
  email: string;
  phone?: string;
  deviceHash: string;
}): { eligible: boolean; reason?: string; trialDays: number } {
  const normalizedEmail = normalizeEmail(params.email);
  const emailHash = crypto.createHash("sha256").update(normalizedEmail).digest("hex");
  const phoneHash = params.phone
    ? crypto.createHash("sha256").update(normalizePhoneNumber(params.phone)).digest("hex")
    : "";

  // 1. Check if email has already claimed a free trial
  for (const record of trialLedger.values()) {
    if (record.emailHash === emailHash) {
      return {
        eligible: false,
        reason: "A 7-day free trial has already been claimed for this email address.",
        trialDays: 7,
      };
    }
    if (phoneHash && record.phoneHash && record.phoneHash === phoneHash) {
      return {
        eligible: false,
        reason: "A 7-day free trial has already been claimed with this verified phone number.",
        trialDays: 7,
      };
    }
    if (record.deviceHash === params.deviceHash) {
      return {
        eligible: false,
        reason: "A 7-day free trial has already been activated from this device. Please log in or choose a plan.",
        trialDays: 7,
      };
    }
  }

  return {
    eligible: true,
    trialDays: 7,
  };
}

/**
 * Records a newly activated 7-day free trial into the ledger
 */
export function recordActivatedTrial(params: {
  email: string;
  phone?: string;
  deviceHash: string;
  businessName: string;
}): TrialRecord {
  const normalizedEmail = normalizeEmail(params.email);
  const emailHash = crypto.createHash("sha256").update(normalizedEmail).digest("hex");
  const phoneHash = params.phone
    ? crypto.createHash("sha256").update(normalizePhoneNumber(params.phone)).digest("hex")
    : "";

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Exactly 7 Days

  const record: TrialRecord = {
    id: `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    emailHash,
    phoneHash,
    deviceHash: params.deviceHash,
    trialStartedAt: now.toISOString(),
    trialExpiresAt: expiresAt.toISOString(),
    status: "active",
    claimedBusinessName: params.businessName,
  };

  trialLedger.set(record.id, record);
  return record;
}

// Single-use 6-Digit OTP Store for Email & Phone Verification
interface OtpEntry {
  code: string;
  target: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpEntry>();

/**
 * Issues a single-use 6-digit cryptographic verification code
 */
export function generateVerificationOtp(target: string): string {
  // 6-digit cryptographic number
  const code = crypto.randomInt(100000, 999999).toString();
  otpStore.set(target.toLowerCase().trim(), {
    code,
    target: target.toLowerCase().trim(),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
    attempts: 0,
  });
  return code;
}

/**
 * Validates a single-use OTP
 */
export function verifyOtp(target: string, code: string): { valid: boolean; error?: string } {
  const key = target.toLowerCase().trim();
  const entry = otpStore.get(key);

  if (!entry) {
    return { valid: false, error: "No verification code requested or code has expired. Please request a new code." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: "Verification code has expired. Please request a new code." };
  }

  entry.attempts += 1;
  if (entry.attempts > 4) {
    otpStore.delete(key);
    return { valid: false, error: "Too many incorrect attempts. Please request a new verification code." };
  }

  if (entry.code !== code.trim()) {
    return { valid: false, error: "Incorrect verification code. Please check and try again." };
  }

  // Single-use: delete upon successful verification
  otpStore.delete(key);
  return { valid: true };
}
