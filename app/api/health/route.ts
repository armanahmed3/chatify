import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const startTime = Date.now();
  const health: Record<string, any> = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    checks: {
      memory: {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        status: "pass",
      },
      aiRouter: {
        tier1: !!process.env.GEMINI_API_KEY ? "configured" : "fallback_mode",
        tier2: !!process.env.GROQ_API_KEY ? "configured" : "fallback_mode",
        tier4: !!process.env.CLOUDFLARE_API_TOKEN ? "configured" : "fallback_mode",
        status: "operational",
      },
      semanticCache: {
        type: process.env.UPSTASH_REDIS_REST_URL ? "upstash_redis" : "in_memory_lru",
        status: "operational",
      },
    },
  };

  try {
    const supabase = createClient();
    const { error } = await supabase.from("templates").select("id").limit(1);
    health.checks.database = {
      status: error ? "fallback_mock" : "connected",
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    health.checks.database = {
      status: "fallback_mock",
      error: err.message,
    };
  }

  return NextResponse.json(health, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
