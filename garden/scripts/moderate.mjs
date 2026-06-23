#!/usr/bin/env node
// Assemble the auto-moderation evidence packet for one change.
// Usage: node garden/scripts/moderate.mjs <path-or-slug> [--json]
// Runs the existing audits, gathers the diff + frontmatter + matching backlog item, and
// prints a compact packet the orchestrator reasons over with garden/skills/auto-moderation.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const contentRoot = path.join(root, "content");
const backlogPath = path.join(root, "garden", "state", "backlog.json");

const COLLECTIONS = [
  "entries",
  "field-notes",
  "build-logs",
  "fragments",
  "patterns",
  "experiments",
  "graveyard",
];

const rawArgs = process.argv.slice(2);

if (rawArgs.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const asJson = rawArgs.includes("--json");
const target = rawArgs.find((arg) => !arg.startsWith("--"));

if (!target) {
  fail("needs a target: a content path or a record slug (or an annotations slug)");
}

const packet = buildPacket(target);

if (asJson) {
  console.log(JSON.stringify(packet, null, 2));
} else {
  printPacket(packet);
}

process.exit(0);

function buildPacket(targetArg) {
  const resolved = resolveTarget(targetArg);
  const isAnnotation = resolved.kind === "annotation";

  const audits = [
    runAudit("content:audit", "scripts/content-audit.mjs"),
    runAudit("privacy:audit", "scripts/privacy-audit.mjs"),
  ];
  if (isAnnotation) {
    audits.push(runAudit("annotations:audit", "scripts/annotations-audit.mjs"));
  }

  return {
    generated: new Date().toISOString(),
    target: targetArg,
    resolved,
    frontmatter: resolved.file && !isAnnotation ? readFrontmatter(resolved.file) : null,
    diff: resolved.file ? gitDiffStat(resolved.file) : gitDiffStat(),
    backlogItem: matchBacklog(resolved, readBacklog()),
    audits,
    allAuditsPassed: audits.every((audit) => audit.passed),
    reminder:
      "Apply garden/skills/auto-moderation/SKILL.md. Privacy is a hard gate. Write the verdict + reasoning to garden/state/digest.md.",
  };
}

function resolveTarget(targetArg) {
  // explicit path
  const asPath = path.resolve(root, targetArg);
  if (existsSync(asPath) && statSync(asPath).isFile()) {
    const rel = path.relative(root, asPath).replace(/\\/g, "/");
    if (rel.startsWith("content/annotations/")) {
      return { kind: "annotation", file: rel, slug: path.basename(rel, ".json") };
    }
    return { kind: "content", file: rel, slug: path.basename(rel, ".mdx") };
  }

  // record slug -> find the mdx across collections (preferred for a bare slug)
  for (const collection of COLLECTIONS) {
    const candidate = `content/${collection}/${targetArg}.mdx`;
    if (existsSync(path.join(root, candidate))) {
      return { kind: "content", file: candidate, slug: targetArg };
    }
  }

  // annotations slug (pass the explicit content/annotations/<slug>.json path to force this)
  const annotationFile = `content/annotations/${targetArg}.json`;
  if (existsSync(path.join(root, annotationFile))) {
    return { kind: "annotation", file: annotationFile, slug: targetArg };
  }

  return { kind: "unknown", file: null, slug: targetArg };
}

function runAudit(name, scriptRelPath) {
  const scriptPath = path.join(root, scriptRelPath);
  if (!existsSync(scriptPath)) {
    return { name, passed: false, status: null, tail: `missing script ${scriptRelPath}` };
  }
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  return {
    name,
    passed: result.status === 0,
    status: result.status,
    tail: tail(output, 12),
  };
}

function gitDiffStat(file) {
  const args = ["diff", "--stat", "HEAD"];
  if (file) {
    args.push("--", file);
  }
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && !result.stdout) {
    return { available: false, stat: (result.stderr ?? "").trim() };
  }
  const stat = (result.stdout ?? "").trim();
  return { available: true, stat: stat || "(no committed-vs-working diff)" };
}

function readFrontmatter(relFile) {
  const source = readFileSync(path.join(root, relFile), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { present: false };
  }
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv && kv[2] !== "") {
      fields[kv[1]] = kv[2].replace(/^"|"$/g, "");
    }
  }
  return { present: true, fields };
}

function readBacklog() {
  if (!existsSync(backlogPath)) {
    return [];
  }
  try {
    const data = JSON.parse(readFileSync(backlogPath, "utf8"));
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

function matchBacklog(resolved, items) {
  const slug = resolved.slug;
  const file = resolved.file;
  // precedence: exact id, then exact target file, then title substring.
  const byId = slug ? items.find((item) => item.id === slug) : undefined;
  if (byId) return byId;
  const byTarget = file
    ? items.find((item) => Array.isArray(item.targets) && item.targets.includes(file))
    : undefined;
  if (byTarget) return byTarget;
  const byTitle = slug
    ? items.find((item) => typeof item.title === "string" && item.title.includes(slug))
    : undefined;
  return byTitle ?? null;
}

function tail(text, lines) {
  if (!text) return "";
  return text.split(/\r?\n/).slice(-lines).join("\n");
}

function printPacket(p) {
  console.log("auto-moderation evidence packet");
  console.log(`  target:   ${p.target} -> ${p.resolved.kind} (${p.resolved.file ?? "unresolved"})`);
  console.log(`  audits:   ${p.audits.map((a) => `${a.name}:${a.passed ? "pass" : "FAIL"}`).join("  ")}`);
  console.log(`  all pass: ${p.allAuditsPassed}`);
  if (p.frontmatter?.present) {
    const f = p.frontmatter.fields;
    console.log(`  record:   ${f.type ?? "?"} / ${f.status ?? "?"} / ${f.confidence ?? "?"} / ${f.visibility ?? "?"}`);
  }
  console.log(`  backlog:  ${p.backlogItem ? `${p.backlogItem.id} (${p.backlogItem.status})` : "no matching item"}`);
  console.log("  diff:");
  console.log(
    (p.diff.stat || "(none)")
      .split(/\r?\n/)
      .map((l) => `    ${l}`)
      .join("\n"),
  );
  for (const audit of p.audits.filter((a) => !a.passed)) {
    console.log(`  ${audit.name} tail:`);
    console.log(audit.tail.split(/\r?\n/).map((l) => `    ${l}`).join("\n"));
  }
  console.log(`  reminder: ${p.reminder}`);
}

function fail(message) {
  console.error(`moderate: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  // resolveTarget: unknown slug
  const unknown = resolveTarget("definitely-not-a-real-slug-xyz");
  assert.equal(unknown.kind, "unknown");
  assert.equal(unknown.file, null);

  // matchBacklog by id, target, title
  const items = [
    { id: "seed-x", status: "ready", title: "do thing for foo" },
    { id: "seed-y", status: "deferred", targets: ["content/entries/foo.mdx"] },
  ];
  assert.equal(matchBacklog({ slug: "seed-x", file: null }, items).id, "seed-x");
  assert.equal(
    matchBacklog({ slug: "foo", file: "content/entries/foo.mdx" }, items).id,
    "seed-y",
  );
  assert.equal(matchBacklog({ slug: "nope", file: null }, items), null);

  // tail keeps the last N lines
  assert.equal(tail("a\nb\nc\nd", 2), "c\nd");

  // frontmatter parse on a synthetic string path is not tested here (needs a file);
  // the field extractor is covered indirectly by the audits.
  console.log("moderate self-check: ok");
}
