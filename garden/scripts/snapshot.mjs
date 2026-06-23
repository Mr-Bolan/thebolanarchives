#!/usr/bin/env node
// Regenerate garden/state/garden-snapshot.json: the compact shape of the workspace and the
// current archive version, so the orchestrator never re-scans the repo.
// Usage: node garden/scripts/snapshot.mjs [--self-check]
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  COLLECTIONS,
  gardenStateDir,
  gitShortSha,
  isFile,
  listDir,
  readBacklog,
  readContentRecords,
  root,
} from "./lib/garden-core.mjs";

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const snapshot = buildSnapshot();
const snapshotPath = path.join(gardenStateDir, "garden-snapshot.json");
writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(
  `garden snapshot: ${snapshot.archive.records} records, ${snapshot.backlog.ready} ready item(s); wrote ${path.relative(root, snapshotPath)}`,
);

function buildSnapshot() {
  const records = readContentRecords();
  const backlog = readBacklog();
  return {
    generated: new Date().toISOString(),
    stale: false,
    version: archiveVersion(records),
    archive: summarizeArchive(records),
    routes: routeList(records),
    backlog: summarizeBacklog(backlog),
    intake: summarizeIntake(),
    lastDigest: lastDigestHeading(),
  };
}

function archiveVersion(records) {
  return {
    sha: gitShortSha(),
    records: records.length,
    publicRecords: records.filter((r) => r.visibility === "public").length,
  };
}

function summarizeArchive(records) {
  const byType = {};
  const byVisibility = {};
  const tagSet = new Set();
  let relatedEdges = 0;
  for (const record of records) {
    byType[record.type] = (byType[record.type] ?? 0) + 1;
    byVisibility[record.visibility] = (byVisibility[record.visibility] ?? 0) + 1;
    record.tags.forEach((tag) => tagSet.add(tag));
    relatedEdges += record.related.length;
  }
  return {
    records: records.length,
    byType,
    byVisibility,
    uniqueTags: tagSet.size,
    relatedEdges,
  };
}

function routeList(records) {
  const staticRoutes = ["/", "/index", "/about"];
  if (isFile("src/app/garden/page.tsx")) staticRoutes.push("/garden");
  const collectionRoutes = COLLECTIONS.map((c) => c.route);
  return {
    static: staticRoutes,
    collections: collectionRoutes,
    records: records.length,
  };
}

function summarizeBacklog(backlog) {
  const items = Array.isArray(backlog.items) ? backlog.items : [];
  const byStatus = {};
  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
  }
  const readyItems = items
    .filter((item) => item.status === "ready")
    .map((item) => ({ id: item.id, title: item.title, priority: item.priority ?? "unset" }));
  return {
    total: items.length,
    ready: readyItems.length,
    byStatus,
    readyItems,
  };
}

function summarizeIntake() {
  const articleNotes = listDir("garden/intake/article-updates", isIntakeNote).length;
  const featureNotes = listDir("garden/intake/feature-requests", isIntakeNote).length;
  const registryPath = path.join(root, "archive-projects.txt");
  let sources = 0;
  if (existsSync(registryPath)) {
    sources = readFileSync(registryPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")).length;
  }
  return { articleNotes, featureNotes, registeredSources: sources };
}

function isIntakeNote(entry) {
  return entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md";
}

function lastDigestHeading() {
  const digestPath = path.join(gardenStateDir, "digest.md");
  if (!existsSync(digestPath)) return null;
  const lines = readFileSync(digestPath, "utf8").split(/\r?\n/);
  const heading = lines.find((line) => line.startsWith("## "));
  return heading ? heading.replace(/^##\s+/, "").trim() : null;
}

function fail(message) {
  console.error(`garden snapshot: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  const archive = summarizeArchive([
    { type: "entry", visibility: "public", tags: ["a", "b"], related: ["x"] },
    { type: "entry", visibility: "draft", tags: ["b"], related: [] },
  ]);
  assert.equal(archive.records, 2);
  assert.equal(archive.byType.entry, 2);
  assert.equal(archive.byVisibility.public, 1);
  assert.equal(archive.uniqueTags, 2);
  assert.equal(archive.relatedEdges, 1);

  const backlog = summarizeBacklog({
    items: [
      { id: "a", title: "A", status: "ready", priority: "high" },
      { id: "b", title: "B", status: "deferred" },
    ],
  });
  assert.equal(backlog.total, 2);
  assert.equal(backlog.ready, 1);
  assert.equal(backlog.readyItems[0].id, "a");
  assert.equal(backlog.byStatus.deferred, 1);
  console.log("garden snapshot self-check: ok");
}
