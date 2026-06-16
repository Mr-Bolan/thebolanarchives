#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const buildLogsRoot = path.join(root, "content", "build-logs");
const args = parseArgs(process.argv.slice(2));

if (args["self-check"]) {
  runSelfCheck();
  process.exit(0);
}

const slug = required("slug");
const note = readNote();
const today = args.date ?? new Date().toISOString().slice(0, 10);
const filePath = path.join(buildLogsRoot, `${slug}.mdx`);

assertSlug(slug);
assertDate(today, "date");
assertSafeText([args.title, args.summary, note, args.next].filter(Boolean).join("\n"));

if (!note.trim()) {
  fail("missing update note; pass --note or --stdin");
}

mkdirSync(buildLogsRoot, { recursive: true });

if (existsSync(filePath)) {
  const source = readFileSync(filePath, "utf8");
  writeFileSync(filePath, appendUpdate(setUpdated(source, today), today, note, args.next), "utf8");
  console.log(`project update: appended ${path.relative(root, filePath)}`);
} else {
  writeFileSync(filePath, newBuildLog({ args, note, slug, today }), "utf8");
  console.log(`project update: created ${path.relative(root, filePath)}`);
}

function newBuildLog({ args, note, slug, today }) {
  const title = required("title");
  const summary = required("summary");
  const visibility = args.visibility ?? "draft";
  const tags = csv(args.tags);
  const tools = csv(args.tools);

  if (!["draft", "unlisted", "public"].includes(visibility)) {
    fail("--visibility must be draft, unlisted, or public");
  }

  if (visibility !== "draft" && tags.length === 0) {
    fail("public and unlisted build logs need --tags");
  }

  return `---
title: "${escapeYaml(title)}"
slug: "${slug}"
type: "build_log"
status: "${args.status ?? "working_note"}"
confidence: "${args.confidence ?? "partial"}"
summary: "${escapeYaml(summary)}"
created: "${today}"
updated: "${today}"
tags:${formatArray(tags)}
tools:${formatArray(tools)}
narrative_origin: "${escapeYaml(args.origin ?? "agent update")}"
visibility: "${visibility}"
related:${formatArray(csv(args.related))}
---

# build_log // ${slug.replaceAll("-", "_")}

## current state

${note.trim()}
${nextMove(args.next)}
`;
}

function appendUpdate(source, today, note, next) {
  const separator = source.endsWith("\n") ? "" : "\n";

  return `${source}${separator}
## update // ${today}

${note.trim()}
${nextMove(next)}
`;
}

function setUpdated(source, today) {
  if (!/^updated:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m.test(source)) {
    fail("existing build log is missing an updated date");
  }

  return source.replace(/^updated:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m, `updated: "${today}"`);
}

function nextMove(value) {
  const text = value?.trim();
  return text ? `\n**next move:** ${text}\n` : "\n";
}

function readNote() {
  if (args.stdin) {
    return readFileSync(0, "utf8");
  }

  return args.note ?? "";
}

function parseArgs(values) {
  const result = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (!value.startsWith("--")) {
      fail(`unexpected argument "${value}"`);
    }

    const key = value.slice(2);
    const next = values[index + 1];

    if (next === undefined || next.startsWith("--")) {
      result[key] = true;
    } else {
      result[key] = next;
      index += 1;
    }
  }

  return result;
}

function required(key) {
  const value = args[key];

  if (typeof value !== "string" || !value.trim()) {
    fail(`missing --${key}`);
  }

  return value.trim();
}

function csv(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatArray(values) {
  return values.length === 0 ? " []" : `\n${values.map((value) => `  - ${escapeYaml(value)}`).join("\n")}`;
}

function escapeYaml(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function assertSlug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    fail("--slug must be lowercase kebab-case");
  }
}

function assertDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`--${label} must use YYYY-MM-DD`);
  }
}

function assertSafeText(text) {
  const unsafeReason = unsafeTextReason(text);

  if (unsafeReason) {
    fail(`refusing update text with ${unsafeReason}`);
  }
}

function unsafeTextReason(text) {
  const checks = [
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "email address"],
    [/\b(localhost|127\.0\.0\.1|10\.\d{1,3}\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i, "private host"],
    [/\b(password|passwd|api[_-]?key|secret|token|bearer)\b/i, "credential term"],
    [/\b(TODO|TBD|CHANGEME|REPLACE_ME|FIXME|lorem|ipsum|dummy|placeholder|replace this)\b/i, "filler or placeholder"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
    [/\b(AKIA|ASIA)[A-Z0-9]{16}\b/, "AWS access key"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/, "API key"],
  ];

  for (const [pattern, label] of checks) {
    if (pattern.test(text)) {
      return label;
    }
  }

  return "";
}

function fail(message) {
  console.error(`project update: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  assert.deepEqual(parseArgs(["--slug", "agent-loop", "--stdin", "--tags", "agents,archive"]), {
    slug: "agent-loop",
    stdin: true,
    tags: "agents,archive",
  });
  assert.equal(formatArray(["agents", "archive"]), "\n  - agents\n  - archive");
  assert.equal(setUpdated('---\nupdated: "2026-06-15"\n---\nbody\n', "2026-06-16").includes('updated: "2026-06-16"'), true);
  assert.equal(unsafeTextReason("TODO: fill this later"), "filler or placeholder");
  console.log("project update self-check: ok");
}
