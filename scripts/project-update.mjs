#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const buildLogsRoot = path.join(root, "content", "build-logs");
let args = parseArgs(process.argv.slice(2));

if (args["from-json"]) {
  args = argsFromCheckin(args);
}

if (args["self-check"]) {
  runSelfCheck();
  process.exit(0);
}

if (args["write-ledger"]) {
  writeProjectLedger();
  process.exit(0);
}

if (args.list) {
  printProjectLedger();
  process.exit(0);
}

const slug = required("slug");
const note = readNote();
const today = args.date || new Date().toISOString().slice(0, 10);
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

function argsFromCheckin(values) {
  const checkinFile = values["from-json"];

  if (typeof checkinFile !== "string" || !checkinFile.trim()) {
    fail("--from-json needs a file path");
  }

  const filePath = path.resolve(root, checkinFile);
  let data;

  try {
    data = JSON.parse(readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    fail(`${checkinFile}: ${error.message}`);
  }

  const loaded = normalizeCheckin(data, checkinFile);
  const overrides = { ...values };
  delete overrides["from-json"];

  return { ...loaded, ...overrides };
}

function normalizeCheckin(data, filePath) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail(`${filePath}: expected a JSON object`);
  }

  return {
    slug: requiredCheckinString(data.slug, "slug", filePath),
    title: optionalCheckinString(data.title, "title", filePath),
    summary: optionalCheckinString(data.summary, "summary", filePath),
    status: optionalCheckinString(data.status, "status", filePath),
    confidence: optionalCheckinString(data.confidence, "confidence", filePath),
    visibility: optionalCheckinString(data.visibility, "visibility", filePath),
    tags: checkinList(data.tags, "tags", filePath),
    tools: checkinList(data.tools, "tools", filePath),
    related: checkinList(data.related, "related", filePath),
    origin: optionalCheckinString(data.origin, "origin", filePath) || "project check-in",
    note: checkinNote(data, filePath),
    next: optionalCheckinString(data.next_move ?? data.next, "next_move", filePath),
    date: optionalCheckinString(data.date, "date", filePath),
  };
}

function checkinNote(data, filePath) {
  const directNote = optionalCheckinString(data.note, "note", filePath);

  if (directNote) {
    return directNote;
  }

  return [
    checkinSection("current state", data.current_state, filePath),
    checkinSection("what changed", data.changed, filePath),
    checkinSection("what broke or is uncertain", data.uncertain, filePath),
    checkinSection("public-safe evidence", data.public_evidence, filePath),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function checkinSection(label, value, filePath) {
  const text = optionalCheckinString(value, label, filePath);
  return text ? `**${label}:**\n${text}` : "";
}

function requiredCheckinString(value, key, filePath) {
  const text = optionalCheckinString(value, key, filePath);

  if (!text) {
    fail(`${filePath}: missing ${key}`);
  }

  return text;
}

function optionalCheckinString(value, key, filePath) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    fail(`${filePath}: ${key} must be a string`);
  }

  return value.trim();
}

function checkinList(value, key, filePath) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(`${filePath}: ${key} must be a string array`);
  }

  return value.join(",");
}

function writeProjectLedger() {
  const ledgerPath = path.join(root, "public", "project-ledger.json");

  mkdirSync(path.dirname(ledgerPath), { recursive: true });
  writeFileSync(ledgerPath, `${JSON.stringify(readProjectLedger(), null, 2)}\n`, "utf8");
  console.log(`project update: wrote ${path.relative(root, ledgerPath)}`);
}

function printProjectLedger() {
  const ledger = readProjectLedger();

  if (args.json) {
    console.log(JSON.stringify(ledger, null, 2));
    return;
  }

  if (ledger.length === 0) {
    console.log("project ledger: no public build logs");
    return;
  }

  for (const project of ledger) {
    console.log(`${project.slug} | ${project.status} | updated ${project.updated}`);
    console.log(`  ${project.current_state}`);
    if (project.next_move) console.log(`  next: ${project.next_move}`);
  }
}

function readProjectLedger() {
  if (!existsSync(buildLogsRoot)) {
    return [];
  }

  return readdirSync(buildLogsRoot)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readProjectFile(path.join(buildLogsRoot, file)))
    .filter((project) => project.visibility === "public")
    .map(({ visibility: _visibility, ...project }) => project)
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
}

function readProjectFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  return projectFromSource(source, filePath);
}

function projectFromSource(source, filePath) {
  const { body, data } = parseFrontmatter(source, filePath);
  const slug = stringValue(data.slug) || path.basename(filePath, ".mdx");
  const update = latestUpdate(body);

  return {
    title: stringValue(data.title),
    slug,
    status: stringValue(data.status),
    confidence: stringValue(data.confidence),
    summary: stringValue(data.summary),
    updated: stringValue(data.updated),
    tags: arrayValue(data.tags),
    tools: arrayValue(data.tools),
    route: `/build-logs/${slug}`,
    current_state: firstPlainParagraph(sectionBlock(body, "current state")) || stringValue(data.summary),
    latest_update: update.text,
    next_move: update.nextMove || nextMoveFromBlock(body),
    visibility: stringValue(data.visibility),
  };
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    fail(`${filePath}: missing frontmatter`);
  }

  const data = {};
  let currentKey;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      const value = data[currentKey];
      data[currentKey] = Array.isArray(value) ? [...value, cleanScalar(listItem[1])] : [cleanScalar(listItem[1])];
      continue;
    }

    const field = line.match(/^([A-Za-z_][\w-]*):(?:\s*(.*))?$/);
    if (!field) {
      fail(`${filePath}: unsupported frontmatter line "${line}"`);
    }

    currentKey = field[1];
    data[currentKey] = cleanValue(field[2] ?? "");
  }

  return { data, body: source.slice(match[0].length).trim() };
}

function cleanValue(value) {
  if (value === "" || value === "[]") {
    return [];
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  return cleanScalar(value);
}

function cleanScalar(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function stringValue(value) {
  return typeof value === "string" ? value : "";
}

function arrayValue(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function latestUpdate(body) {
  const updates = Array.from(body.matchAll(/(?:^|\r?\n)## update \/\/ (\d{4}-\d{2}-\d{2})\s*\r?\n([\s\S]*?)(?=\r?\n##\s|$)/gi));
  const latest = updates.at(-1);

  if (!latest) {
    return { text: "", nextMove: "" };
  }

  return {
    text: firstPlainParagraph(latest[2]),
    nextMove: nextMoveFromBlock(latest[2]),
  };
}

function sectionBlock(body, heading) {
  const pattern = new RegExp(`(?:^|\\r?\\n)##\\s+${escapeRegExp(heading)}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n##\\s|$)`, "i");
  return body.match(pattern)?.[1] ?? "";
}

function firstPlainParagraph(block) {
  for (const paragraph of block.split(/\r?\n\s*\r?\n/)) {
    const text = plainText(paragraph);

    if (text) {
      return text.slice(0, 320);
    }
  }

  return "";
}

function nextMoveFromBlock(block) {
  return block.match(/\*\*next move:\*\*\s*(.+)/i)?.[1]?.trim() ?? "";
}

function plainText(block) {
  return block
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.startsWith("{`") && !trimmed.startsWith("`}");
    })
    .join(" ")
    .replace(/\*\*next move:\*\*.*$/i, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  assert.equal(
    normalizeCheckin(
      {
        slug: "agent-loop",
        current_state: "The other project can hand the archive a small JSON check-in.",
        changed: "The archive importer turns that check-in into a build-log update.",
        tags: ["agents", "archive"],
        tools: ["codex"],
        next_move: "copy the JSON shape into active projects.",
      },
      "self-check.json",
    ).note.includes("**what changed:**"),
    true,
  );
  assert.equal(setUpdated('---\nupdated: "2026-06-15"\n---\nbody\n', "2026-06-16").includes('updated: "2026-06-16"'), true);
  assert.equal(unsafeTextReason("TODO: fill this later"), "filler or placeholder");
  assert.equal(
    projectFromSource(
      `---
title: "agent loop"
slug: "agent-loop"
status: "working_note"
confidence: "partial"
summary: "A plain summary of the project state."
updated: "2026-06-16"
tags:
  - agents
tools: []
visibility: "public"
---

# build_log // agent_loop

## current state

The loop writes updates into public-safe build logs.

## update // 2026-06-16

The ledger now reads project state from the same MDX source.

**next move:** use it after each owner check-in.
`,
      "self-check.mdx",
    ).next_move,
    "use it after each owner check-in.",
  );
  console.log("project update self-check: ok");
}
