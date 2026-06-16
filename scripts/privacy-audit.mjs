#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const blocklistPath = path.join(root, "privacy-blocklist.json");
const contentRoot = path.join(root, "content");
const collections = ["entries", "field-notes", "build-logs", "fragments", "patterns", "experiments", "graveyard"];
const builtInChecks = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "email address"],
  [/\b(localhost|127\.0\.0\.1|10\.\d{1,3}\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i, "private host"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/\b(AKIA|ASIA)[A-Z0-9]{16}\b/, "AWS access key"],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/, "API key"],
];

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const terms = existsSync(blocklistPath) ? readTerms(blocklistPath) : [];
const targets = findTargets();
const hits = targets.flatMap((target) => scanText(path.relative(root, target), readFileSync(target, "utf8"), terms));

for (const hit of hits) {
  console.error(`error: ${hit}`);
}

console.log(`privacy audit: scanned ${targets.length} public-facing file${targets.length === 1 ? "" : "s"}`);
console.log(`privacy audit: ${hits.length} privacy hit${hits.length === 1 ? "" : "s"}`);

process.exit(hits.length === 0 ? 0 : 1);

function readTerms(filePath) {
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  const terms = Array.isArray(data) ? data : data.terms;

  if (!Array.isArray(terms) || !terms.every((term) => typeof term === "string" && term.trim())) {
    throw new Error("privacy-blocklist.json must be an array of strings or { \"terms\": [...] }");
  }

  return terms.map((term) => term.trim());
}

function scanText(file, text, terms) {
  const hits = [];

  for (const [pattern, label] of builtInChecks) {
    if (pattern.test(text)) {
      hits.push(`${file} contains ${label}`);
    }
  }

  const lower = text.toLowerCase();
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) {
      hits.push(`${file} contains blocked term "${term}"`);
    }
  }

  return hits;
}

function findTargets() {
  const files = [];

  for (const folder of collections) {
    const directory = path.join(contentRoot, folder);
    if (!existsSync(directory)) continue;

    for (const file of readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
      const filePath = path.join(directory, file);
      const source = readFileSync(filePath, "utf8");
      const visibility = frontmatterValue(source, "visibility");

      if (visibility === "public" || visibility === "unlisted") {
        files.push(filePath);
      }
    }
  }

  for (const file of ["archive-index.json", "project-ledger.json"]) {
    const publicFile = path.join(root, "public", file);
    if (existsSync(publicFile)) {
      files.push(publicFile);
    }
  }

  return files;
}

function frontmatterValue(source, key) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return "";

  const field = match[1].match(new RegExp(`^${key}:\\s*["']?([^"'\r\n]+)["']?\\s*$`, "m"));
  return field ? field[1].trim() : "";
}

function runSelfCheck() {
  assert.deepEqual(scanText("clean.mdx", "credentials are a topic, not a secret", []), []);
  assert.equal(scanText("email.mdx", "contact me at user@example.com", [])[0], "email.mdx contains email address");
  assert.equal(scanText("host.mdx", "see http://192.168.1.10/admin", [])[0], "host.mdx contains private host");
  assert.equal(scanText("custom.mdx", "owner-real-name", ["owner-real-name"])[0], 'custom.mdx contains blocked term "owner-real-name"');
  console.log("privacy audit self-check: ok");
}
