#!/usr/bin/env node
// Validate garden/state/backlog.json and regenerate the human mirror backlog.md.
// Usage: node garden/scripts/backlog.mjs [--self-check]
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { backlogPath, gardenStateDir, readBacklog, root } from "./lib/garden-core.mjs";

const VALID_STATUS = ["ready", "in-progress", "blocked", "deferred", "needs-source", "done", "published"];
const VALID_TYPE = ["content", "feature", "refactor", "graph", "annotation", "privacy", "chore"];
const SECTION_ORDER = ["ready", "needs-source", "in-progress", "blocked", "deferred", "done", "published"];

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const backlog = readBacklog();
const problems = validateBacklog(backlog);

for (const problem of problems) {
  console.error(`error: ${problem}`);
}
if (problems.length > 0) {
  fail(`${problems.length} backlog problem${problems.length === 1 ? "" : "es"}`);
}

const markdown = renderBacklogMarkdown(backlog);
const mirrorPath = path.join(gardenStateDir, "backlog.md");
writeFileSync(mirrorPath, markdown, "utf8");

console.log(
  `garden backlog: ${backlog.items.length} item${backlog.items.length === 1 ? "" : "s"} valid; wrote ${path.relative(root, mirrorPath)}`,
);

function validateBacklog(data) {
  const problems = [];
  if (!Array.isArray(data.items)) {
    return ["backlog.json has no items array"];
  }
  const ids = new Set();
  for (const [index, item] of data.items.entries()) {
    const where = item.id ? `item ${item.id}` : `item #${index}`;
    if (!item.id) problems.push(`${where}: missing id`);
    else if (ids.has(item.id)) problems.push(`${where}: duplicate id`);
    else ids.add(item.id);
    if (!item.title) problems.push(`${where}: missing title`);
    if (!item.summary) problems.push(`${where}: missing summary`);
    if (!VALID_STATUS.includes(item.status)) problems.push(`${where}: invalid status "${item.status}"`);
    if (!VALID_TYPE.includes(item.type)) problems.push(`${where}: invalid type "${item.type}"`);
  }
  return problems;
}

function renderBacklogMarkdown(data) {
  const today = new Date().toISOString().slice(0, 10);
  const bySection = new Map(SECTION_ORDER.map((status) => [status, []]));
  for (const item of data.items) {
    if (!bySection.has(item.status)) bySection.set(item.status, []);
    bySection.get(item.status).push(item);
  }

  const lines = [
    "# backlog (generated)",
    "",
    "Generated mirror of `garden/state/backlog.json`. Do not edit by hand — run",
    "`npm run garden:backlog` to regenerate. Edit the JSON instead.",
    "",
    `Last generated: ${today}`,
    "",
  ];

  for (const status of bySection.keys()) {
    const items = bySection.get(status);
    lines.push(`## ${status}`, "");
    if (items.length === 0) {
      lines.push("_(none)_", "");
      continue;
    }
    for (const item of items) {
      lines.push(`- **${item.title}** (\`${item.id}\`, ${item.type}, ${item.priority ?? "unset"})`);
      lines.push(`  ${item.summary}`);
      lines.push("");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function fail(message) {
  console.error(`garden backlog: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  assert.deepEqual(validateBacklog({ items: [] }), []);
  assert.deepEqual(
    validateBacklog({
      items: [{ id: "a", title: "t", summary: "s", status: "ready", type: "content" }],
    }),
    [],
  );
  const bad = validateBacklog({
    items: [{ id: "a", title: "t", summary: "s", status: "nope", type: "content" }],
  });
  assert.equal(bad.length, 1);
  assert.match(bad[0], /invalid status/);
  const dup = validateBacklog({
    items: [
      { id: "a", title: "t", summary: "s", status: "ready", type: "content" },
      { id: "a", title: "t2", summary: "s2", status: "ready", type: "content" },
    ],
  });
  assert.ok(dup.some((p) => /duplicate id/.test(p)));

  const md = renderBacklogMarkdown({
    items: [{ id: "x", title: "X", summary: "does x", status: "ready", type: "content", priority: "high" }],
  });
  assert.match(md, /## ready/);
  assert.match(md, /\*\*X\*\* \(`x`, content, high\)/);
  assert.match(md, /## done\s*\n\s*\n_\(none\)_/);
  console.log("garden backlog self-check: ok");
}
