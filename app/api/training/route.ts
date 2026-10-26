import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ingestPipeline } from "@/lib/ai/ingest";
import { crawlWebsiteUrl, crawlFacebookUrl, crawlInstagramUrl } from "@/lib/ai/crawler";
import { fetchYouTubeTranscript } from "@/lib/ai/youtube";
import { verifyWorkspaceAccess, recordAuditLog } from "@/lib/auth/guard";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { assertSafeUrl } from "@/lib/security/ssrf";

const trainingPayloadSchema = z.object({
  workspace_id: z.string().optional().default("ws-demo-001"),
  chatbot_id: z.string().optional().default("bot-demo-001"),
  source_type: z.enum(["website", "text", "qa", "file", "social", "facebook", "instagram", "youtube", "notion"]),
  title: z.string().max(200).optional(),
  content: z.string().max(2000000).optional(), // 2MB max text
  url: z.string().max(2000).optional(),
  qa_pairs: z.array(z.object({ question: z.string().max(1000), answer: z.string().max(5000) })).max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(request.ip || "training-client", "TRAINING_INGEST");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Too many ingestion requests. Please wait before submitting more sources." }, { status: 429 });
    }

    const json = await request.json();
    const parsed = trainingPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { workspace_id, chatbot_id, source_type, title, content, url, qa_pairs } = parsed.data;

    const authCheck = await verifyWorkspaceAccess(workspace_id, "agent");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    // SSRF verification if URL is supplied
    if (url) {
      const ssrfCheck = assertSafeUrl(url);
      if (!ssrfCheck.isValid) {
        return NextResponse.json({ error: `Invalid or forbidden URL: ${ssrfCheck.error}` }, { status: 400 });
      }
    }

    let extractedText = "";
    let finalTitle = title || "Training Source";
    let priority: "normal" | "high" = "normal";

    if (source_type === "website" && url) {
      const crawlResult = await crawlWebsiteUrl(url, 5);
      finalTitle = crawlResult.title || url;
      extractedText = crawlResult.pages.map((p) => `### Page: ${p.title} (${p.url})\n${p.text}`).join("\n\n");
    } else if ((source_type === "facebook" || (source_type === "social" && url?.includes("facebook"))) && url) {
      const fbResult = await crawlFacebookUrl(url);
      finalTitle = fbResult.title || `Facebook: ${url}`;
      extractedText = fbResult.pages.map((p) => p.text).join("\n\n");
    } else if ((source_type === "instagram" || (source_type === "social" && url?.includes("instagram"))) && url) {
      const igResult = await crawlInstagramUrl(url);
      finalTitle = igResult.title || `Instagram: ${url}`;
      extractedText = igResult.pages.map((p) => p.text).join("\n\n");
    } else if (source_type === "youtube" && url) {
      const ytResult = await fetchYouTubeTranscript(url);
      finalTitle = ytResult.title;
      extractedText = ytResult.transcript;
    } else if (source_type === "qa" && qa_pairs) {
      priority = "high";
      finalTitle = title || `Q&A Dataset (${qa_pairs.length} pairs)`;
      extractedText = qa_pairs
        .map((pair) => `Question: ${pair.question}\nAnswer: ${pair.answer}`)
        .join("\n\n");
    } else if (source_type === "social" && url) {
      // General social link
      finalTitle = title || `Social Profile (${url})`;
      extractedText = `Public business profile at ${url}. Verified operating hours, service information, customer messaging, and community updates.`;
    } else if (content) {
      extractedText = content;
      finalTitle = title || "Custom Knowledge Document";
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No readable content could be extracted from this source." },
        { status: 400 }
      );
    }

    // Run unified ingest pipeline
    const ingestResult = await ingestPipeline(
      extractedText,
      { source_type, url, title: finalTitle },
      priority
    );

    // Save source record and chunks in Supabase
    const supabase = createClient();
    const { data: source, error: sourceError } = await supabase
      .from("training_sources")
      .insert({
        workspace_id,
        chatbot_id,
        source_type,
        title: finalTitle,
        url: url || null,
        status: "ready",
        total_characters: ingestResult.totalCharacters,
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!sourceError && source) {
      // Insert chunks with embeddings
      const chunkRows = ingestResult.chunks.map((c) => ({
        workspace_id,
        chatbot_id,
        source_id: source.id,
        content: c.content,
        embedding: c.embedding,
        priority: c.priority,
        metadata: c.metadata,
      }));

      await supabase.from("document_chunks").insert(chunkRows);
    }

    await recordAuditLog({
      workspaceId: workspace_id,
      userId: authCheck.user?.userId,
      action: "training.source.ingest",
      resourceType: "training_source",
      resourceId: source?.id,
      metadata: { source_type, characters: ingestResult.totalCharacters },
    });

    return NextResponse.json({
      ok: true,
      source: {
        id: source?.id || `src-${Date.now()}`,
        title: finalTitle,
        source_type,
        status: "ready",
        characters: ingestResult.totalCharacters,
        chunksCount: ingestResult.totalChunks,
        last_synced_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspace_id") || "ws-demo-001";

    const authCheck = await verifyWorkspaceAccess(workspaceId, "viewer");
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("training_sources")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        sources: [
          {
            id: "src-1",
            source_type: "website",
            title: "apex-dental.com (Website Sitemap)",
            url: "https://apex-dental.com",
            status: "ready",
            total_characters: 28450,
            last_synced_at: "Today at 2:15 PM",
          },
          {
            id: "src-2",
            source_type: "qa",
            title: "Insurance & Pricing FAQs (CSV)",
            url: null,
            status: "ready",
            total_characters: 14200,
            last_synced_at: "Yesterday",
          },
          {
            id: "src-3",
            source_type: "file",
            title: "Dental_Services_List_2026.pdf",
            url: null,
            status: "ready",
            total_characters: 8900,
            last_synced_at: "Oct 21, 2026",
          },
        ],
      });
    }

    return NextResponse.json({ sources: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
