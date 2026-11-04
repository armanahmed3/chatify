import { NextRequest, NextResponse } from "next/server";
import { serverError } from "@/lib/http";
import { z } from "zod";
import { crawlWebsiteUrl, crawlFacebookUrl, crawlInstagramUrl, normalizeCrawlUrl } from "@/lib/ai/crawler";
import { assertSafeUrlResolved } from "@/lib/security/ssrf";
import { getAuthenticatedUser } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/http";
import { checkRateLimit } from "@/lib/security/ratelimit";

const crawlSchema = z.object({
  type: z.enum(["website", "facebook", "instagram"]),
  url: z.string().min(3).max(2000),
  max_pages: z.number().min(1).max(10).optional().default(5),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const rateCheck = await checkRateLimit(`crawl:${user.userId}:${getClientIp(request)}`, "TRAINING_INGEST");
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many crawl requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = crawlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid crawl request." }, { status: 400 });
    }

    const { type, url: rawUrl, max_pages } = parsed.data;
    const normalizedUrl = normalizeCrawlUrl(rawUrl);

    // Verify SSRF safety
    const ssrf = await assertSafeUrlResolved(normalizedUrl);
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
    return serverError(err, "crawl");
  }
}

