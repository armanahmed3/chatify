import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkText, generateEmbedding } from "../../lib/ai/ingest.ts";
import { stripHtmlToCleanText } from "../../lib/ai/crawler.ts";
import { extractYouTubeVideoId } from "../../lib/ai/youtube.ts";

test("Milestone 3 — Text Chunking (~1000 char / 200 overlap)", () => {
  const shortText = "Apex Dental Clinic provides emergency teeth cleaning and whitening.";
  const singleChunk = chunkText(shortText, 1000, 200);
  assert.equal(singleChunk.length, 1);
  assert.equal(singleChunk[0].content, shortText);

  // Large text chunking
  const paragraph = "We offer professional dental services. ".repeat(40); // ~1600 chars
  const chunks = chunkText(paragraph, 1000, 200);
  assert.ok(chunks.length >= 2, "Should split text into multiple chunks");
  assert.ok(chunks[0].content.length <= 1100, "First chunk should be around chunk size");
  assert.equal(chunks[0].priority, "normal");
});

test("Milestone 3 — HTML to Clean Text Extraction", () => {
  const rawHtml = `
    <html>
      <head><script>alert('malicious')</script><style>.ad{color:red}</style></head>
      <body>
        <nav><a href="/">Home</a></nav>
        <h1>Apex Dental Clinic</h1>
        <p>We are open Monday to Friday &amp; Saturday mornings.</p>
        <footer>Copyright 2026</footer>
      </body>
    </html>
  `;

  const clean = stripHtmlToCleanText(rawHtml);
  assert.equal(clean.includes("<script>"), false, "Must strip script tags");
  assert.equal(clean.includes("<style>"), false, "Must strip style tags");
  assert.equal(clean.includes("Apex Dental Clinic"), true, "Must preserve heading text");
  assert.equal(clean.includes("Monday to Friday & Saturday"), true, "Must decode HTML entities");
});

test("Milestone 3 — YouTube URL Extraction", () => {
  const url1 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const url2 = "https://youtu.be/dQw4w9WgXcQ";
  assert.equal(extractYouTubeVideoId(url1), "dQw4w9WgXcQ");
  assert.equal(extractYouTubeVideoId(url2), "dQw4w9WgXcQ");
  assert.equal(extractYouTubeVideoId("https://example.com"), null);
});

test("Milestone 3 — Vector Embedding Dimensions", async () => {
  const vector = await generateEmbedding("Apex Dental Emergency Care");
  assert.equal(vector.length, 768, "Embedding vector must have exactly 768 dimensions for pgvector");
});
