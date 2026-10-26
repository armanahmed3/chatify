/**
 * Chatify Enterprise Secure Structured Logger
 * Automatically masks sensitive tokens, passwords, secrets, and PII from logs.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "api_key",
  "apikey",
  "service_role",
  "access_token",
  "refresh_token",
  "credit_card",
  "card_number",
  "cvv",
  "client_secret",
]);

function redactValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;
  
  if (typeof value === "string") {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes("secret") || lowerKey.includes("token") || lowerKey.includes("key")) {
      return "[REDACTED]";
    }
    // Check if looks like a bearer token or API key
    if (value.startsWith("Bearer ") || value.startsWith("gsk_") || value.startsWith("re_") || value.startsWith("sk_")) {
      return "[REDACTED]";
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(key, item));
  }

  if (typeof value === "object") {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      cleaned[k] = redactValue(k, v);
    }
    return cleaned;
  }

  return value;
}

export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    const payload = {
      level: "info",
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? redactValue("meta", meta) : {}),
    };
    console.log(JSON.stringify(payload));
  },

  warn: (message: string, meta?: Record<string, any>) => {
    const payload = {
      level: "warn",
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? redactValue("meta", meta) : {}),
    };
    console.warn(JSON.stringify(payload));
  },

  error: (message: string, err?: any, meta?: Record<string, any>) => {
    const payload = {
      level: "error",
      timestamp: new Date().toISOString(),
      message,
      error: err instanceof Error ? { message: err.message, name: err.name } : err,
      ...(meta ? redactValue("meta", meta) : {}),
    };
    console.error(JSON.stringify(payload));
  },

  audit: (action: string, details: { userId?: string; workspaceId?: string; ip?: string; resource?: string; status?: "success" | "failure"; [key: string]: any }) => {
    const payload = {
      level: "audit",
      timestamp: new Date().toISOString(),
      action,
      ...redactValue("audit", details),
    };
    console.info(JSON.stringify(payload));
  },
};
