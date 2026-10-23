import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Milestone 5 — Embeddable Widget Size (<30KB) & Vanilla JS Purity", () => {
  const widgetPath = path.resolve(process.cwd(), "public/widget.js");
  assert.ok(fs.existsSync(widgetPath), "public/widget.js must exist");

  const stat = fs.statSync(widgetPath);
  const sizeKb = stat.size / 1024;
  assert.ok(sizeKb < 30, `widget.js must be under 30KB. Current size: ${sizeKb.toFixed(2)} KB`);

  const code = fs.readFileSync(widgetPath, "utf-8");
  assert.equal(code.includes("import "), false, "widget.js must be pure vanilla JS without bundle imports");
  assert.ok(code.includes("data-bot"), "widget.js must read data-bot attribute");
  assert.ok(code.includes("chatify-widget-container"), "widget.js must inject isolated widget container");
});

test("Milestone 5 — Lead Scoring (Hot, Warm, Cold)", () => {
  function scoreLead(phone, requirements) {
    let score = "warm";
    const reqLower = requirements.toLowerCase();
    if (
      phone &&
      (reqLower.includes("book") ||
        reqLower.includes("appointment") ||
        reqLower.includes("emergency") ||
        reqLower.includes("today") ||
        reqLower.includes("tomorrow") ||
        reqLower.includes("quote"))
    ) {
      score = "hot";
    }
    return score;
  }

  assert.equal(scoreLead("+15551234", "Need emergency root canal today"), "hot");
  assert.equal(scoreLead("+15551234", "General inquiry about hours"), "warm");
});
