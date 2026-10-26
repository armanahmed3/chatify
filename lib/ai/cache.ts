/**
 * Semantic Cache Engine (Cosine similarity >= 0.92)
 * Instant match in <20ms, $0 token cost, NEVER counts towards monthly limits
 */

export interface CacheEntry {
  query: string;
  answer: string;
  embedding: number[];
  citations: Array<{ title: string; url?: string; snippet?: string }>;
  timestamp: number;
}

// In-memory fallback cache for high-speed local dev and zero-config deployment
const localSemanticCache: CacheEntry[] = [
  {
    query: "Do you accept Delta Dental insurance?",
    answer: "Yes! We accept Delta Dental, Cigna, MetLife, and most major PPO dental insurance plans. We verify benefits and file claims directly for you.",
    embedding: [],
    citations: [{ title: "Insurance & Pricing FAQs" }],
    timestamp: Date.now(),
  },
  {
    query: "What are your business hours?",
    answer: "We are open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM for emergency appointments.",
    embedding: [],
    citations: [{ title: "Apex Dental Operating Schedule" }],
    timestamp: Date.now(),
  },
];

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude ? dotProduct / magnitude : 0;
}

export async function lookupSemanticCache(
  query: string,
  queryEmbedding: number[],
  similarityThreshold: number = 0.92
): Promise<CacheEntry | null> {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Try Upstash Redis exact match
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && !redisUrl.includes("your-redis")) {
    try {
      const hexKey = Buffer.from(normalizedQuery).toString("hex").substring(0, 64);
      const res = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["GET", `faq:${hexKey}`]),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          try {
            const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
            if (
              parsed?.answer &&
              !parsed.answer.includes("available nahi hai") &&
              !parsed.answer.includes("don't have the exact") &&
              !parsed.answer.includes("Maaf kijiye")
            ) {
              return parsed;
            }
          } catch {
            // format parse error fallback
          }
        }
      }
    } catch {
      // Redis network fallback
    }
  }

  // 2. Check local exact string matches
  for (const entry of localSemanticCache) {
    if (entry.query.toLowerCase().trim() === normalizedQuery) {
      if (
        !entry.answer.includes("available nahi hai") &&
        !entry.answer.includes("don't have the exact") &&
        !entry.answer.includes("Maaf kijiye")
      ) {
        return entry;
      }
    }
  }

  // 3. Check semantic similarity if query vector is provided
  if (queryEmbedding.length > 0) {
    for (const entry of localSemanticCache) {
      if (entry.embedding && entry.embedding.length > 0) {
        const sim = cosineSimilarity(queryEmbedding, entry.embedding);
        if (
          sim >= similarityThreshold &&
          !entry.answer.includes("available nahi hai") &&
          !entry.answer.includes("don't have the exact") &&
          !entry.answer.includes("Maaf kijiye")
        ) {
          return entry;
        }
      }
    }
  }

  return null;
}

export async function saveSemanticCache(
  query: string,
  answer: string,
  embedding: number[],
  citations: Array<{ title: string; url?: string; snippet?: string }>
) {
  // Never cache negative fallback replies
  if (
    answer.includes("available nahi hai") ||
    answer.includes("don't have the exact details") ||
    answer.includes("Maaf kijiye")
  ) {
    return;
  }
  const entry: CacheEntry = {
    query,
    answer,
    embedding,
    citations,
    timestamp: Date.now(),
  };

  localSemanticCache.push(entry);

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && !redisUrl.includes("your-redis")) {
    try {
      const hexKey = Buffer.from(query.toLowerCase().trim()).toString("hex").substring(0, 64);
      await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["SET", `faq:${hexKey}`, JSON.stringify(entry)]),
      });
    } catch {
      // Non-blocking cache write
    }
  }
}
