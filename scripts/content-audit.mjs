import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const writeIndex = process.argv.includes("--write-index");

const collections = {
  entries: { type: "entry", route: "/entries" },
  "field-notes": { type: "field_note", route: "/field-notes" },
  "build-logs": { type: "build_log", route: "/build-logs" },
  fragments: { type: "fragment", route: "/fragments" },
  patterns: { type: "pattern", route: "/patterns" },
  experiments: { type: "experiment", route: "/experiments" },
  graveyard: { type: "graveyard_note", route: "/graveyard" },
};

const statuses = new Set(["fragment", "sketch", "working_note", "field_tested", "stable_artefact", "retired"]);
const confidences = new Set(["low", "partial", "medium", "high", "field_confirmed"]);
const visibilities = new Set(["public", "unlisted", "draft"]);
const externalLinkKinds = new Set(["repository", "demo", "documentation", "related-site", "artifact"]);
const required = [
  "title",
  "slug",
  "type",
  "status",
  "confidence",
  "summary",
  "created",
  "updated",
  "tags",
  "tools",
  "narrative_origin",
  "visibility",
  "related",
];

const errors = [];
const warnings = [];
const missingMetadata = [];
const relatedLinkIssues = [];
const records = [];

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

for (const [folder, collection] of Object.entries(collections)) {
  const directory = path.join(contentRoot, folder);

  if (!fs.existsSync(directory)) {
    continue;
  }

  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
    const filePath = path.join(directory, file);
    const slugFromFile = file.replace(/\.mdx$/, "");

    try {
      const source = fs.readFileSync(filePath, "utf8");
      const { data, body } = parseFrontmatter(source, filePath);
      const record = validateRecord({ body, collection, data, filePath, folder, slugFromFile });

      if (record) {
        records.push(record);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
}

const routableSlugs = new Set(records.filter((record) => record.visibility !== "draft").map((record) => record.slug));
const allSlugs = new Set(records.map((record) => record.slug));

for (const record of records) {
  for (const relatedSlug of record.related) {
    if (relatedSlug === record.slug) {
      errors.push(`${record.file}: related must not include its own slug`);
    } else if (!allSlugs.has(relatedSlug)) {
      const issue = `${record.file}: related slug "${relatedSlug}" does not resolve`;
      relatedLinkIssues.push(issue);
      warnings.push(issue);
    } else if (!routableSlugs.has(relatedSlug)) {
      const issue = `${record.file}: related slug "${relatedSlug}" points at draft content and will not render`;
      relatedLinkIssues.push(issue);
      warnings.push(issue);
    }
  }
}

const publicRecords = records
  .filter((record) => record.visibility === "public")
  .sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title));
const unlistedRecords = records
  .filter((record) => record.visibility === "unlisted")
  .sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title));
const draftRecords = records
  .filter((record) => record.visibility === "draft")
  .sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title));
const safeToPublish = records
  .filter((record) => record.visibility !== "public" && record.tags.length > 0 && !hasRecordIssue(record))
  .sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title));

if (writeIndex && errors.length === 0) {
  const indexPath = path.join(root, "public", "archive-index.json");
  fs.writeFileSync(
    indexPath,
    `${JSON.stringify(publicRecords.map(toIndexRecord), null, 2)}\n`,
    "utf8",
  );
}

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

for (const error of errors) {
  console.error(`error: ${error}`);
}

reportRecords("public records", publicRecords);
reportRecords("unlisted records", unlistedRecords);
reportRecords("draft records", draftRecords);
reportRecords("records safe to publish", safeToPublish);
console.log(`content audit: missing metadata: ${missingMetadata.length}`);
console.log(`content audit: unresolved related links: ${relatedLinkIssues.length}`);

const summary = `${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${
  warnings.length === 1 ? "" : "s"
}, ${publicRecords.length} public record${publicRecords.length === 1 ? "" : "s"}`;

console.log(`content audit: ${summary}`);

if (writeIndex && errors.length === 0) {
  console.log("content audit: wrote public/archive-index.json");
}

process.exit(errors.length === 0 ? 0 : 1);

function validateRecord({ body, collection, data, filePath, folder, slugFromFile }) {
  for (const field of required) {
    if (data[field] === undefined) {
      const issue = `${filePath}: missing required field "${field}"`;
      missingMetadata.push(issue);
      errors.push(issue);
    }
  }

  const visibility = stringValue(data.visibility);
  const tags = arrayValue(data.tags);
  const tools = arrayValue(data.tools);
  const related = arrayValue(data.related);
  const aliases = data.aliases === undefined ? undefined : arrayValue(data.aliases);
  const externalLinks = data.external_links;
  const slug = stringValue(data.slug);
  const created = stringValue(data.created);
  const updated = stringValue(data.updated);
  const lastVerified = data.last_verified === undefined ? undefined : stringValue(data.last_verified);

  checkString(data.title, "title", filePath);
  checkString(data.summary, "summary", filePath);
  checkString(data.narrative_origin, "narrative_origin", filePath);

  if (!isKebabCase(slug)) {
    errors.push(`${filePath}: slug must be lowercase kebab-case`);
  }

  if (slug && slug !== slugFromFile) {
    errors.push(`${filePath}: slug "${slug}" must match filename "${slugFromFile}"`);
  }

  if (data.type !== collection.type) {
    errors.push(`${filePath}: type must be "${collection.type}" for content/${folder}`);
  }

  if (!statuses.has(data.status)) {
    errors.push(`${filePath}: status must be one of ${Array.from(statuses).join(", ")}`);
  }

  if (!confidences.has(data.confidence)) {
    errors.push(`${filePath}: confidence must be one of ${Array.from(confidences).join(", ")}`);
  }

  if (!visibilities.has(visibility)) {
    errors.push(`${filePath}: visibility must be public, unlisted, or draft`);
  }

  checkDate(created, "created", filePath);
  checkDate(updated, "updated", filePath);

  if (lastVerified !== undefined) {
    checkDate(lastVerified, "last_verified", filePath);
  }

  if (created && updated && updated < created) {
    errors.push(`${filePath}: updated must be the same as or later than created`);
  }

  checkStringArray(tags, "tags", filePath);
  checkStringArray(tools, "tools", filePath);
  checkStringArray(related, "related", filePath);

  if (aliases !== undefined) {
    checkStringArray(aliases, "aliases", filePath);
  }

  if (externalLinks !== undefined) {
    checkExternalLinks(externalLinks, filePath);
  }

  if (data.sequence !== undefined && typeof data.sequence !== "number") {
    errors.push(`${filePath}: sequence must be a number`);
  }

  if (visibility !== "draft" && tags.length === 0) {
    if (data.tags_intentionally_empty === true) {
      warnings.push(`${filePath}: published record intentionally has no tags`);
    } else {
      errors.push(`${filePath}: public and unlisted records must have tags`);
    }
  }

  const badTag = tags.find((tag) => !isKebabCase(tag));
  if (badTag) {
    errors.push(`${filePath}: tag "${badTag}" must be lowercase kebab-case`);
  }

  const summary = stringValue(data.summary);
  if (summary && (summary.length < 80 || summary.length > 220)) {
    warnings.push(`${filePath}: summary should be 80-220 characters`);
  }

  if (data.confidence === "field_confirmed" && !lastVerified && !data.source_context && !hasBodyEvidence(body)) {
    errors.push(`${filePath}: field_confirmed content needs evidence metadata or body evidence`);
  }

  return {
    title: stringValue(data.title),
    slug,
    type: data.type,
    status: data.status,
    confidence: data.confidence,
    summary,
    created,
    updated,
    tags,
    tools,
    narrative_origin: stringValue(data.narrative_origin),
    visibility,
    related,
    external_links: Array.isArray(externalLinks) ? externalLinks : undefined,
    folder,
    route: `${collection.route}/${slug}`,
    record_id: data.record_id,
    series: data.series,
    sequence: data.sequence,
    last_verified: lastVerified,
    source_context: data.source_context,
    aliases,
    file: filePath,
  };
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    throw new Error(`${filePath}: missing frontmatter`);
  }

  const data = {};
  let currentKey;
  let currentObjectKey;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      continue;
    }

    const objectListItem = line.match(/^\s*-\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (objectListItem && currentKey) {
      const value = data[currentKey];
      const item = { [objectListItem[1]]: cleanValue(objectListItem[2] ?? "") };
      data[currentKey] = Array.isArray(value) ? [...value, item] : [item];
      currentObjectKey = currentKey;
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      const value = data[currentKey];
      data[currentKey] = Array.isArray(value) ? [...value, cleanScalar(listItem[1])] : [cleanScalar(listItem[1])];
      currentObjectKey = undefined;
      continue;
    }

    const nestedField = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (nestedField && currentKey && currentObjectKey === currentKey) {
      const value = data[currentKey];
      const last = Array.isArray(value) ? value[value.length - 1] : undefined;

      if (!isObject(last)) {
        throw new Error(`${filePath}: unsupported frontmatter line "${line}"`);
      }

      last[nestedField[1]] = cleanValue(nestedField[2] ?? "");
      continue;
    }

    const field = line.match(/^([A-Za-z_][\w-]*):(?:\s*(.*))?$/);
    if (!field) {
      throw new Error(`${filePath}: unsupported frontmatter line "${line}"`);
    }

    currentKey = field[1];
    currentObjectKey = undefined;
    data[currentKey] = cleanValue(field[2] ?? "");
  }

  return { data, body: source.slice(match[0].length).trim() };
}

function cleanValue(value) {
  if (value === "" || value === "[]") {
    return [];
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  return cleanScalar(value);
}

function cleanScalar(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function stringValue(value) {
  return typeof value === "string" ? value : "";
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function checkString(value, field, filePath) {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${filePath}: ${field} must be a string`);
  }
}

function checkStringArray(value, field, filePath) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    errors.push(`${filePath}: ${field} must be a string array`);
  }
}

function checkExternalLinks(value, filePath) {
  if (!Array.isArray(value)) {
    errors.push(`${filePath}: external_links must be an array`);
    return;
  }

  for (const [index, link] of value.entries()) {
    const label = `${filePath}: external_links[${index}]`;

    if (!isObject(link)) {
      errors.push(`${label} must be an object`);
      continue;
    }

    checkString(link.label, "external_links.label", label);
    checkString(link.url, "external_links.url", label);
    checkString(link.kind, "external_links.kind", label);

    if (typeof link.kind === "string" && !externalLinkKinds.has(link.kind)) {
      errors.push(`${label}: kind must be one of ${Array.from(externalLinkKinds).join(", ")}`);
    }

    if (typeof link.url === "string" && !isPublicUrl(link.url)) {
      errors.push(`${label}: url must be a public http or https URL`);
    }
  }
}

function checkDate(value, field, filePath) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${filePath}: ${field} must use YYYY-MM-DD`);
  }
}

function isKebabCase(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function hasBodyEvidence(body) {
  return /\b(evidence|verified|observed|measured|field confirmed|source)\b/i.test(body);
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPublicUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toIndexRecord(record) {
  const {
    file: _file,
    folder: _folder,
    visibility: _visibility,
    ...metadata
  } = record;

  return metadata;
}

function reportRecords(label, items) {
  const names = items.map((record) => `${record.slug || path.basename(record.file)} (${record.folder})`);
  console.log(`content audit: ${label}: ${names.length === 0 ? "none" : names.join(", ")}`);
}

function hasRecordIssue(record) {
  const prefix = `${record.file}:`;
  return [...errors, ...warnings].some((issue) => issue.startsWith(prefix));
}

function runSelfCheck() {
  const source = `---
external_links:
  - label: "project repository"
    url: "https://github.com/Mr-Bolan/example-project"
    kind: "repository"
---
body`;
  const { data } = parseFrontmatter(source, "self-check.mdx");
  checkExternalLinks(data.external_links, "self-check.mdx");
  const [link] = data.external_links;

  if (!isObject(link) || link.label !== "project repository" || link.kind !== "repository") {
    throw new Error("self-check.mdx: external_links parser failed");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  console.log("content audit self-check: ok");
}
