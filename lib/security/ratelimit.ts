/**
 * Multi-Tier Enterprise Rate Limiter
 * Integrates with Upstash Redis when configured; falls back cleanly to an in-memory sliding-window token bucket.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// In-memory sliding window store for local/single-node development and fallback
interface MemoryRecord {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryRecord>();

function cleanOldMemoryRecords(windowMs: number) {
  const now = Date.now();
  memoryStore.forEach((record, key) => {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  });
}

// Periodically clean memory store every 5 minutes
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => cleanOldMemoryRecords(60000), 300000);
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
}

function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = memoryStore.get(identifier) || { timestamps: [] };

  // Filter out expired timestamps
  const validTimestamps = record.timestamps.filter((t) => now - t < config.windowMs);

  if (validTimestamps.length >= config.maxRequests) {
    const oldest = validTimestamps[0];
    const reset = Math.ceil((oldest + config.windowMs - now) / 1000);
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset,
    };
  }

  validTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: validTimestamps });

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - validTimestamps.length,
    reset: Math.ceil(config.windowMs / 1000),
  };
}

let upstashRedisClient: Redis | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes("placeholder")
) {
  try {
    upstashRedisClient = Redis.fromEnv();
  } catch (err) {
    upstashRedisClient = null;
  }
}

/**
 * Standard Tier Configurations
 */
export const RATE_LIMIT_TIERS = {
  // Stricter limit on login to prevent brute-force (5 attempts per 15 minutes)
  AUTH_LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  // Signup tier (20 requests per 15 minutes per IP)
  AUTH_SIGNUP: { maxRequests: 20, windowMs: 15 * 60 * 1000 },
  // Chat Widget per IP (30 queries per minute)
  CHAT_WIDGET: { maxRequests: 30, windowMs: 60 * 1000 },
  // Ingest / Training per workspace (15 imports per minute)
  TRAINING_INGEST: { maxRequests: 15, windowMs: 60 * 1000 },
  // General API endpoints (100 requests per minute)
  GENERAL_API: { maxRequests: 100, windowMs: 60 * 1000 },
  // Webhook endpoints (60 requests per minute)
  WEBHOOKS: { maxRequests: 60, windowMs: 60 * 1000 },
};

/**
 * Verifies if the request is within rate limits.
 */
export async function checkRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMIT_TIERS = "GENERAL_API"
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const config = RATE_LIMIT_TIERS[tier];

  if (upstashRedisClient) {
    try {
      const windowSeconds = Math.max(1, Math.round(config.windowMs / 1000));
      const limiter = new Ratelimit({
        redis: upstashRedisClient,
        limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSeconds} s`),
        prefix: `chatify:ratelimit:${tier.toLowerCase()}`,
      });

      const res = await limiter.limit(identifier);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.ceil(res.reset / 1000),
      };
    } catch (err) {
      // Fallback to in-memory store if Redis experiences downtime
      return checkMemoryRateLimit(`${tier}:${identifier}`, config);
    }
  }

  return checkMemoryRateLimit(`${tier}:${identifier}`, config);
}
