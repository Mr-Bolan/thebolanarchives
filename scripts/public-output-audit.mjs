#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const auditedOutputNames = new Set(["cname"]);
const auditedOutputExtensions = new Set([".html", ".json", ".txt", ".xml"]);
const auditedBundleExtensions = new Set([".js", ".css"]);
const checks = [
  [/\b(TODO|TBD|CHANGE[-_]?ME|REPLACE[-_]?ME|FIXME)\b/i, "placeholder marker"],
  [/\b(lorem|ipsum)\b/i, "lorem ipsum text"],
  [/\b(dummy|placeholder)\b/i, "filler word"],
  [/\breplace this\b/i, "template text"],
  [/\bcoming soon\b/i, "coming-soon text"],
  [/\bfuture live\b/i, "future-live filler"],
  [/\bfuture interactive\b/i, "future-interactive filler"],
  [/\beventually let\b/i, "eventual-feature filler"],
  [/\bPending:\b/i, "pending marker"],
];
const bundleChecks = checks.filter(([, label]) => ["placeholder marker", "lorem ipsum text", "template text"].includes(label));

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

if (!existsSync(outDir)) {
  fail("out/ does not exist; run npm run build first");
}

const files = outputFiles();
const findings = files.flatMap((file) => scanFile(file));

for (const finding of findings) {
  console.error(`error: ${finding.file}: ${finding.label}: ${finding.match}`);
}

if (findings.length > 0) {
  fail(`${findings.length} public output filler match${findings.length === 1 ? "" : "es"}`);
}

console.log(`public output audit: scanned ${files.length} exported text files, 0 filler matches`);

function outputFiles(directory = outDir) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return outputFiles(fullPath);
    return entry.isFile() && isAuditedOutputFile(entry.name) ? [fullPath] : [];
  });
}

function isAuditedOutputFile(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  return auditedOutputNames.has(fileName.toLowerCase()) || auditedOutputExtensions.has(extension) || auditedBundleExtensions.has(extension);
}

function scanFile(file) {
  const source = readFileSync(file, "utf8");
  const relative = path.relative(outDir, file);

  return checksForFile(relative).flatMap(([pattern, label]) => {
    const match = source.match(pattern);
    return match ? [{ file: relative, label, match: snippet(source, match.index ?? 0) }] : [];
  });
}

function checksForFile(fileName) {
  return auditedBundleExtensions.has(path.extname(fileName).toLowerCase()) ? bundleChecks : checks;
}

function snippet(source, index) {
  return source
    .slice(Math.max(0, index - 40), index + 80)
    .replace(/\s+/g, " ")
    .trim();
}

function fail(message) {
  console.error(`public output audit: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  assert.deepEqual(scanText("ok", "clean text"), []);
  assert.equal(scanText("bad.html", "TODO: replace this later")[0].label, "placeholder marker");
  assert.equal(scanText("CNAME", "CHANGE-ME.example.com")[0].label, "placeholder marker");
  assert.equal(scanText("bundle.js", "const host = 'CHANGE-ME.example.com';")[0].label, "placeholder marker");
  assert.deepEqual(scanText("bundle.js", "input.placeholder = 'anonymous reader';"), []);
  assert.equal(isAuditedOutputFile("feed.xml"), true);
  assert.equal(isAuditedOutputFile("CNAME"), true);
  assert.equal(isAuditedOutputFile("bundle.js"), true);
  assert.equal(snippet("abc TODO def", 4), "abc TODO def");
  console.log("public output audit self-check: ok");
}

function scanText(file, source) {
  return checksForFile(file).flatMap(([pattern, label]) => {
    const match = source.match(pattern);
    return match ? [{ file, label, match: snippet(source, match.index ?? 0) }] : [];
  });
}
