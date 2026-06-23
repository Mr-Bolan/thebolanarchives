#!/usr/bin/env node
// Emit public/archive-graph.json for the Blackbox Garden map (parity with archive-index.json).
// Built from public records only, mirroring src/lib/graph.ts. Run in prebuild.
// Usage: node scripts/write-graph.mjs [--self-check]
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  buildArchiveGraphFromRecords,
  readContentRecords,
  root,
} from "../garden/scripts/lib/garden-core.mjs";

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const publicRecords = readContentRecords().filter((r) => r.visibility === "public");
const graph = buildArchiveGraphFromRecords(publicRecords);
const payload = {
  generated: new Date().toISOString(),
  nodes: graph.nodes,
  edges: graph.edges,
};

const outPath = path.join(root, "public", "archive-graph.json");
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `archive graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges; wrote ${path.relative(root, outPath)}`,
);

function runSelfCheck() {
  const records = [
    { slug: "a", title: "A", type: "entry", status: "working_note", route: "/entries/a", tags: ["x", "y"], related: ["b"], series: null, sequence: null },
    { slug: "b", title: "B", type: "pattern", status: "sketch", route: "/patterns/b", tags: ["x"], related: ["a"], series: null, sequence: null },
  ];
  const graph = buildArchiveGraphFromRecords(records);
  // 2 records + 2 unique tags
  assert.equal(graph.nodes.length, 4);
  // related a-b (deduped to one), tag edges a-x, a-y, b-x => 1 + 3 = 4
  assert.equal(graph.edges.length, 4);
  const relatedEdges = graph.edges.filter((e) => e.kind === "related");
  assert.equal(relatedEdges.length, 1);
  const tagX = graph.nodes.find((n) => n.id === "tag:x");
  assert.equal(tagX.degree, 2);
  // related to a missing slug is dropped
  const orphan = buildArchiveGraphFromRecords([
    { slug: "c", title: "C", type: "entry", route: "/entries/c", tags: [], related: ["ghost"], series: null, sequence: null },
  ]);
  assert.equal(orphan.edges.length, 0);
  console.log("archive graph self-check: ok");
}
