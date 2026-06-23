#!/usr/bin/env node
// Stage 00 intake (mechanical part): fold intake notes and registered sources into the
// backlog, keeping raw note bodies and source identities out of committed state. Raw notes
// and source refs are written to the gitignored garden/state/private/ and referenced by id;
// the draft stage agent reads them there and does the real de-identification.
// Usage: node garden/scripts/intake.mjs [--self-check] [--dry-run]
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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

const sources = enumerateSources(backlog, existingIds, created, dryRun);
const promoted = promoteSourceBacklog(backlog, registeredSourceCount());

if (created.length === 0 && promoted.length === 0) {
  console.log(`garden intake: no new items (rehydrated ${sources.rehydrated} source ref(s))`);
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
  `garden intake: created ${created.length} item(s), promoted ${promoted.length}, rehydrated ${sources.rehydrated} source ref(s)`,
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

// ── registered sources -> per-source backlog items ─────────────────────────────────
// Each registered repo/path becomes one committed backlog item with an OPAQUE id and a
// neutral title/summary. The actual source identity (owner/repo or path) is written only to
// the gitignored garden/state/private/<id>.md so repo names never enter committed state.
// Idempotent: dedupes by id, so a source that already has an item (in any status, including
// "published") is never re-queued. Private refs are rehydrated if missing (e.g. fresh clone).
function enumerateSources(data, ids, createdAcc, dry) {
  if (!existsSync(registryPath)) return { rehydrated: 0 };
  let rehydrated = 0;
  for (const raw of readFileSync(registryPath, "utf8").split(/\r?\n/)) {
    const src = parseSource(raw);
    if (!src) continue;
    const id = sourceId(src.key);
    if (!dry && ensureSourcePrivateFile(id, src)) rehydrated += 1;
    if (ids.has(id)) continue;
    data.items.push(buildSourceItem(id, src));
    ids.add(id);
    createdAcc.push(id);
  }
  return { rehydrated };
}

function parseSource(raw) {
  const line = (raw || "").trim();
  if (!line || line.startsWith("#")) return null;
  const isGithub = /^github\s+/i.test(line) || /github\.com/i.test(line);
  if (isGithub) {
    const slug = line
      .replace(/^github\s+/i, "")
      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .replace(/\.git$/i, "")
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "");
    const parts = slug.split("/").filter(Boolean);
    if (parts.length < 2) return null; // profile page or malformed line, not a repo
    return { kind: "github", key: `${parts[0]}/${parts[1]}`.toLowerCase(), raw: line };
  }
  return { kind: "local", key: line.replace(/[\\/]+$/, "").toLowerCase(), raw: line };
}

function sourceId(key) {
  return `source-${createHash("sha1").update(key).digest("hex").slice(0, 8)}`;
}

function ensureSourcePrivateFile(id, src) {
  if (!existsSync(privateDir)) mkdirSync(privateDir, { recursive: true });
  const file = path.join(privateDir, `${id}.md`);
  if (existsSync(file)) return false;
  const body = [
    "# registered source ref (gitignored, local only)",
    `id: ${id}`,
    `kind: ${src.kind}`,
    `source: ${src.raw}`,
    `key: ${src.key}`,
    `added: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "# The draft stage reads this to know which repo/path to scan and de-identify.",
    "# Treat the source name/owner as private; never copy it into committed state.",
    '# After an article for this source is published, set the matching backlog item',
    '# status to "published" in garden/state/backlog.json so intake will not re-queue it.',
    "",
  ].join("\n");
  writeFileSync(file, body, "utf8");
  return true;
}

function buildSourceItem(id, src) {
  // Committed item carries NO source identity. Only the gitignored privateRef does.
  return {
    id,
    type: "content",
    title: "draft a de-identified article from a registered source",
    status: "ready",
    priority: "medium",
    mode: "content-draft",
    source: "registry",
    sourceKind: src.kind,
    summary:
      "A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.",
    privateRef: `garden/state/private/${id}.md`,
    created: new Date().toISOString().slice(0, 10),
  };
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

  // registry source parsing
  assert.equal(parseSource(""), null);
  assert.equal(parseSource("# comment"), null);
  assert.equal(parseSource("https://github.com/Owner/Repo").key, "owner/repo");
  assert.equal(parseSource("github Owner/Repo").key, "owner/repo");
  assert.equal(parseSource("https://github.com/Owner/Repo.git").key, "owner/repo");
  assert.equal(parseSource("https://github.com/Owner/Repo/").key, "owner/repo");
  assert.equal(parseSource("https://github.com/Owner"), null); // profile, not a repo
  assert.equal(parseSource("https://github.com/Owner?tab=repositories"), null);
  assert.equal(parseSource("../my-proj/").key, "../my-proj");

  // opaque, stable, collision-distinct ids
  assert.match(sourceId("owner/repo"), /^source-[0-9a-f]{8}$/);
  assert.equal(sourceId("owner/repo"), sourceId("owner/repo"));
  assert.notEqual(sourceId("owner/repo"), sourceId("owner/other"));

  // committed source item must not leak the source identity
  const si = buildSourceItem("source-abcd1234", { kind: "github", key: "secretowner/secretrepo", raw: "https://github.com/SecretOwner/SecretRepo" });
  assert.equal(si.status, "ready");
  assert.equal(si.source, "registry");
  assert.equal(si.privateRef, "garden/state/private/source-abcd1234.md");
  assert.doesNotMatch(JSON.stringify(si), /secret/i);

  console.log("garden intake self-check: ok");
}
