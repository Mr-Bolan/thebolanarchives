#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const annotationsRoot = path.join(root, "content", "annotations");
const contentRoot = path.join(root, "content");
const collections = ["entries", "field-notes", "build-logs", "fragments", "patterns", "experiments", "graveyard"];
const labels = new Set(["reader note", "field comment", "annotation"]);
const statuses = new Set(["approved", "archived"]);
const required = ["id", "recordSlug", "anchorId", "label", "body", "author", "created", "status"];
const errors = [];
const warnings = [];
const ids = new Map();
const records = readRecords();

if (existsSync(annotationsRoot)) {
  for (const file of readdirSync(annotationsRoot).filter((name) => name.endsWith(".json")).sort()) {
    auditFile(path.join(annotationsRoot, file), file.replace(/\.json$/, ""));
  }
}

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

for (const error of errors) {
  console.error(`error: ${error}`);
}

console.log(`annotations audit: scanned ${ids.size} annotation${ids.size === 1 ? "" : "s"}`);
console.log(`annotations audit: ${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`);

process.exit(errors.length === 0 ? 0 : 1);

function auditFile(filePath, slugFromFile) {
  let data;
  const fileIds = new Map();

  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(filePath)}: invalid JSON (${error.message})`);
    return;
  }

  if (!Array.isArray(data)) {
    errors.push(`${relative(filePath)}: annotation file must be a JSON array`);
    return;
  }

  for (const [index, annotation] of data.entries()) {
    const label = `${relative(filePath)}[${index}]`;

    if (!isObject(annotation)) {
      errors.push(`${label}: annotation must be an object`);
      continue;
    }

    for (const field of required) {
      if (annotation[field] === undefined) {
        errors.push(`${label}: missing required field "${field}"`);
      }
    }

    const id = stringValue(annotation.id);
    const recordSlug = stringValue(annotation.recordSlug);
    const anchorId = stringValue(annotation.anchorId);
    const body = stringValue(annotation.body);

    checkString(annotation.id, "id", label);
    checkString(annotation.recordSlug, "recordSlug", label);
    checkString(annotation.anchorId, "anchorId", label);
    checkString(annotation.body, "body", label);
    checkString(annotation.author, "author", label);
    checkString(annotation.created, "created", label);
    checkOptionalString(annotation.excerpt, "excerpt", label);

    if (id) {
      if (fileIds.has(id)) {
        errors.push(`${label}: duplicate id "${id}" also used in ${fileIds.get(id)} in this file`);
      } else {
        fileIds.set(id, label);
      }

      if (ids.has(id) && ids.get(id).file !== relative(filePath)) {
        errors.push(`${label}: duplicate id "${id}" also used in ${ids.get(id).label}`);
      } else {
        ids.set(id, { file: relative(filePath), label });
      }
    }

    if (recordSlug && recordSlug !== slugFromFile) {
      errors.push(`${label}: recordSlug must match filename "${slugFromFile}"`);
    }

    if (annotation.label !== undefined && !labels.has(annotation.label)) {
      errors.push(`${label}: label must be one of ${Array.from(labels).join(", ")}`);
    }

    if (annotation.status !== undefined && !statuses.has(annotation.status)) {
      errors.push(`${label}: status must be one of ${Array.from(statuses).join(", ")}`);
    }

    if (annotation.created !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(stringValue(annotation.created))) {
      errors.push(`${label}: created must use YYYY-MM-DD`);
    }

    if (body.trim().length === 0) {
      errors.push(`${label}: body must not be empty`);
    }

    scanForPrivateText(annotation, label);

    const record = records.get(recordSlug);
    if (!recordSlug || !record) {
      errors.push(`${label}: target record "${recordSlug || "(missing)"}" does not exist`);
      continue;
    }

    if (record.visibility === "draft") {
      errors.push(`${label}: target record "${recordSlug}" is draft and will not generate a route`);
    } else if (record.visibility === "unlisted") {
      warnings.push(`${label}: target record "${recordSlug}" is unlisted; annotation sidecar is still public repo data`);
    }

    if (anchorId) {
      checkAnchor(anchorId, record, label);
    }
  }
}

function readRecords() {
  const result = new Map();

  for (const folder of collections) {
    const directory = path.join(contentRoot, folder);
    if (!existsSync(directory)) continue;

    for (const file of readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
      const filePath = path.join(directory, file);
      const source = readFileSync(filePath, "utf8");
      const slug = frontmatterValue(source, "slug") || file.replace(/\.mdx$/, "");
      const visibility = frontmatterValue(source, "visibility") || "draft";
      const body = stripLeadingHeading(stripFrontmatter(source));

      result.set(slug, {
        filePath,
        headingIds: headingIds(body),
        paragraphCount: paragraphCount(body),
        visibility,
      });
    }
  }

  return result;
}

function checkAnchor(anchorId, record, label) {
  const paragraph = anchorId.match(/^p-(\d+)$/);

  if (paragraph) {
    const number = Number(paragraph[1]);

    if (number < 1 || number > record.paragraphCount) {
      errors.push(`${label}: anchorId "${anchorId}" is outside detected paragraph range p-1..p-${record.paragraphCount}`);
    }

    return;
  }

  if (!record.headingIds.has(anchorId)) {
    errors.push(`${label}: anchorId "${anchorId}" does not match a detected heading id`);
  }
}

function headingIds(source) {
  const counts = new Map();
  const ids = new Set();

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^(#{2,4})\s+(.+?)(?:\s+#+)?$/);
    if (!match) continue;

    const text = stripMarkdown(match[2]);
    if (text) ids.add(slugifyHeading(text, counts));
  }

  return ids;
}

function paragraphCount(source) {
  let count = 0;
  let inFence = false;

  for (const block of source.split(/\r?\n\s*\r?\n/)) {
    const text = block.trim();
    if (!text) continue;

    if (text.startsWith("```") || text.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;
    if (/^(#{1,6})\s+/.test(text)) continue;
    if (/^</.test(text)) continue;
    if (/^[-*+]\s+/.test(text) || /^\d+\.\s+/.test(text)) continue;
    if (/^>/.test(text) || /^\|/.test(text)) continue;
    if (/^(import|export)\s/.test(text)) continue;

    count += 1;
  }

  return count;
}

function scanForPrivateText(annotation, label) {
  const text = Object.values(annotation)
    .filter((value) => typeof value === "string")
    .join("\n");
  const checks = [
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "email address"],
    [/https?:\/\//i, "URL"],
    [/\b(localhost|127\.0\.0\.1|10\.\d{1,3}\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i, "private host"],
    [/\b(password|passwd|api[_-]?key|secret|token|bearer)\b/i, "credential term"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
    [/\b(AKIA|ASIA)[A-Z0-9]{16}\b/, "AWS access key"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/, "API key"],
    [/\b(TODO|TBD|CHANGEME|REPLACE_ME|FIXME)\b/i, "placeholder"],
  ];

  for (const [pattern, name] of checks) {
    if (pattern.test(text)) {
      errors.push(`${label}: contains obvious private placeholder/URL/credential text (${name})`);
    }
  }
}

function stripFrontmatter(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

function stripLeadingHeading(source) {
  return source.replace(/^#\s+.*(?:\r?\n)+/, "").trim();
}

function frontmatterValue(source, key) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return "";

  const field = match[1].match(new RegExp(`^${key}:\\s*["']?([^"'\r\n]+)["']?\\s*$`, "m"));
  return field ? field[1].trim() : "";
}

function slugifyHeading(text, counts = new Map()) {
  const base =
    text
      .toLowerCase()
      .replace(/[`*_~[\]()]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const seen = counts.get(base) ?? 0;

  counts.set(base, seen + 1);

  return seen === 0 ? base : `${base}-${seen + 1}`;
}

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

function checkString(value, field, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${label}: ${field} must be a non-empty string`);
  }
}

function checkOptionalString(value, field, label) {
  if (value !== undefined && (typeof value !== "string" || value.trim().length === 0)) {
    errors.push(`${label}: ${field} must be a non-empty string when present`);
  }
}

function stringValue(value) {
  return typeof value === "string" ? value : "";
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function relative(filePath) {
  return path.relative(root, filePath);
}
