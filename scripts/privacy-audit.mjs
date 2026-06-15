#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const blocklistPath = path.join(root, "privacy-blocklist.json");
const contentRoot = path.join(root, "content");
const collections = ["entries", "field-notes", "build-logs", "fragments", "patterns", "experiments", "graveyard"];

if (!existsSync(blocklistPath)) {
  console.log("privacy audit: skipped; privacy-blocklist.json is not configured");
  process.exit(0);
}

const terms = readTerms(blocklistPath);
const targets = findTargets();
const hits = [];

for (const target of targets) {
  const text = readFileSync(target, "utf8").toLowerCase();

  for (const term of terms) {
    if (text.includes(term.toLowerCase())) {
      hits.push(`${path.relative(root, target)} contains blocked term "${term}"`);
    }
  }
}

for (const hit of hits) {
  console.error(`error: ${hit}`);
}

console.log(`privacy audit: scanned ${targets.length} public-facing file${targets.length === 1 ? "" : "s"}`);
console.log(`privacy audit: ${hits.length} blocked term hit${hits.length === 1 ? "" : "s"}`);

process.exit(hits.length === 0 ? 0 : 1);

function readTerms(filePath) {
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  const terms = Array.isArray(data) ? data : data.terms;

  if (!Array.isArray(terms) || !terms.every((term) => typeof term === "string" && term.trim())) {
    throw new Error("privacy-blocklist.json must be an array of strings or { \"terms\": [...] }");
  }

  return terms.map((term) => term.trim());
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

  const publicIndex = path.join(root, "public", "archive-index.json");
  if (existsSync(publicIndex)) {
    files.push(publicIndex);
  }

  return files;
}

function frontmatterValue(source, key) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return "";

  const field = match[1].match(new RegExp(`^${key}:\\s*["']?([^"'\r\n]+)["']?\\s*$`, "m"));
  return field ? field[1].trim() : "";
}
