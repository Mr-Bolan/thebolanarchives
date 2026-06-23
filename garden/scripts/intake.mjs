#!/usr/bin/env node
// Stage 00 intake (mechanical part): fold intake notes and registered sources into the
// backlog, keeping raw note bodies out of committed state. Raw notes are moved to the
// gitignored garden/state/private/ and referenced by id; the draft stage agent reads them
// there and does the real de-identification.
// Usage: node garden/scripts/intake.mjs [--self-check] [--dry-run]
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { backlogPath, gardenStateDir, parseFrontmatter, readBacklog, root } from "./lib/garden-core.mjs";

const INTAKE_FOLDERS = [
  { rel: "garden/intake/article-updates", type: "content", mode: "content-update" },
  { rel: "garden/intake/feature-requests", type: "feature", mode: "site-feature" },
];
const privateDir = path.join(gardenStateDir, "private");
const registryPath = path.join(root, "archive-projects.txt");

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const dryRun = process.argv.includes("--dry-run");
const backlog = readBacklog();
const existingIds = new Set(backlog.items.map((item) => item.id));
const created = [];

for (const folder of INTAKE_FOLDERS) {
  for (const note of intakeNotes(folder.rel)) {
    const id = noteId(folder.type, note);
    if (existingIds.has(id)) continue;
    const fm = parseFrontmatter(readFileSync(path.join(root, folder.rel, note), "utf8"));
    const item = buildItemFromNote(id, folder, fm);
    if (!dryRun) {
      archiveRawNote(folder.rel, note, id);
    }
    backlog.items.push(item);
    existingIds.add(id);
    created.push(id);
  }
}

const promoted = promoteSourceBacklog(backlog, registeredSourceCount());
if (created.length === 0 && promoted.length === 0) {
  console.log("garden intake: no new items (no intake notes, no source changes)");
  process.exit(0);
}

if (dryRun) {
  console.log(`garden intake (dry-run): would create ${created.length}, promote ${promoted.length}`);
  process.exit(0);
}

backlog.updated = new Date().toISOString().slice(0, 10);
writeFileSync(backlogPath, `${JSON.stringify(backlog, null, 2)}\n`, "utf8");
regenerateBacklogMirror();

console.log(
  `garden intake: created ${created.length} item(s) [${created.join(", ") || "-"}], promoted ${promoted.length} [${promoted.join(", ") || "-"}]`,
);

function intakeNotes(relFolder) {
  const dir = path.join(root, relFolder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".md") && name !== "README.md");
}

function noteId(type, fileName) {
  const base = path
    .basename(fileName, ".md")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `intake-${type}-${base || "note"}`;
}

function buildItemFromNote(id, folder, fm) {
  // Keep the committed summary neutral: never copy raw note body into committed state.
  // metadata keys (intent/kind/area/priority) are safe; the body lives in state/private.
  const descriptor = fm.intent || fm.kind || folder.type;
  const area = fm.area ? ` (${fm.area})` : "";
  return {
    id,
    type: folder.type,
    title: `intake: ${descriptor}${area}`,
    status: "ready",
    priority: ["high", "medium", "low"].includes(fm.priority) ? fm.priority : "medium",
    mode: folder.mode,
    source: "intake",
    summary:
      "Owner intake note awaiting interpretation and de-identification by the draft stage. Raw note is in gitignored state/private; do not assume it is public-safe.",
    privateRef: `garden/state/private/${id}.md`,
    target: typeof fm.target === "string" ? fm.target : null,
    created: new Date().toISOString().slice(0, 10),
  };
}

function archiveRawNote(relFolder, fileName, id) {
  if (!existsSync(privateDir)) mkdirSync(privateDir, { recursive: true });
  const from = path.join(root, relFolder, fileName);
  const to = path.join(privateDir, `${id}.md`);
  renameSync(from, to);
}

function registeredSourceCount() {
  if (!existsSync(registryPath)) return 0;
  return readFileSync(registryPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#")).length;
}

function promoteSourceBacklog(data, sourceCount) {
  if (sourceCount <= 0) return [];
  const promoted = [];
  for (const item of data.items) {
    if (item.status === "needs-source" && item.type === "content") {
      item.status = "ready";
      item.notes = `Promoted to ready: ${sourceCount} source(s) registered in archive-projects.txt.`;
      promoted.push(item.id);
    }
  }
  return promoted;
}

function regenerateBacklogMirror() {
  spawnSync(process.execPath, [path.join(root, "garden", "scripts", "backlog.mjs")], {
    cwd: root,
    stdio: "ignore",
  });
}

function fail(message) {
  console.error(`garden intake: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  assert.equal(noteId("content", "Fix The Dashboard.md"), "intake-content-fix-the-dashboard");
  assert.equal(noteId("feature", "add-graph!!!.md"), "intake-feature-add-graph");
  assert.equal(noteId("content", "  .md"), "intake-content-note");

  const item = buildItemFromNote(
    "intake-content-x",
    { type: "content", mode: "content-update" },
    { intent: "fix", area: "homepage", priority: "high" },
  );
  assert.equal(item.status, "ready");
  assert.equal(item.priority, "high");
  assert.equal(item.mode, "content-update");
  assert.equal(item.privateRef, "garden/state/private/intake-content-x.md");
  assert.match(item.title, /intake: fix \(homepage\)/);
  // committed summary must not leak body
  assert.doesNotMatch(item.summary, /dashboard/i);

  const data = {
    items: [
      { id: "s1", type: "content", status: "needs-source" },
      { id: "s2", type: "feature", status: "needs-source" },
    ],
  };
  assert.deepEqual(promoteSourceBacklog(data, 0), []);
  assert.deepEqual(promoteSourceBacklog(data, 2), ["s1"]);
  assert.equal(data.items[0].status, "ready");
  assert.equal(data.items[1].status, "needs-source");
  console.log("garden intake self-check: ok");
}
