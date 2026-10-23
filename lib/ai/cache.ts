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

  // 1. Check exact string matches
  for (const entry of localSemanticCache) {
    if (entry.query.toLowerCase().trim() === normalizedQuery) {
      return entry;
    }
  }

  // 2. Check semantic similarity if query vector is provided
  if (queryEmbedding.length > 0) {
    for (const entry of localSemanticCache) {
      if (entry.embedding && entry.embedding.length > 0) {
        const sim = cosineSimilarity(queryEmbedding, entry.embedding);
        if (sim >= similarityThreshold) {
          return entry;
        }
      }
    }
  }

  return null;
}

export function saveSemanticCache(
  query: string,
  answer: string,
  embedding: number[],
  citations: Array<{ title: string; url?: string; snippet?: string }>
) {
  localSemanticCache.push({
    query,
    answer,
    embedding,
    citations,
    timestamp: Date.now(),
  });
}
