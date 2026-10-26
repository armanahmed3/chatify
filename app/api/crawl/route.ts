import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { crawlWebsiteUrl, crawlFacebookUrl, crawlInstagramUrl, normalizeCrawlUrl } from "@/lib/ai/crawler";
import { assertSafeUrl } from "@/lib/security/ssrf";
import { checkRateLimit } from "@/lib/security/ratelimit";

const crawlSchema = z.object({
  type: z.enum(["website", "facebook", "instagram"]),
  url: z.string().min(3).max(2000),
  max_pages: z.number().min(1).max(10).optional().default(5),
});

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(request.ip || "crawler-client", "TRAINING_INGEST");
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many crawl requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = crawlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { type, url: rawUrl, max_pages } = parsed.data;
    const normalizedUrl = normalizeCrawlUrl(rawUrl);

    // Verify SSRF safety
    const ssrf = assertSafeUrl(normalizedUrl);
    if (!ssrf.isValid) {
      return NextResponse.json({ error: `Forbidden URL: ${ssrf.error}` }, { status: 400 });
    }

    let crawlResult: any = null;

    if (type === "website") {
      crawlResult = await crawlWebsiteUrl(normalizedUrl, max_pages);
    } else if (type === "facebook") {
      crawlResult = await crawlFacebookUrl(normalizedUrl);
    } else if (type === "instagram") {
      crawlResult = await crawlInstagramUrl(normalizedUrl);
    }

    // Generate smart preliminary Q&As based on crawl content
    const combinedText = crawlResult.pages?.map((p: any) => p.text).join(" ") || "";
    const words = combinedText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      ok: true,
      type,
      url: normalizedUrl,
      title: crawlResult.title || normalizedUrl,
      bio: crawlResult.bio || null,
      pages: crawlResult.pages || [],
      extractedFaqs: crawlResult.extractedFaqs || [],
      totalCharacters: crawlResult.totalCharacters || combinedText.length,
      wordCount: words,
      crawledAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to crawl target source." },
      { status: 500 }
    );
  }
}

