#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const annotationsRoot = path.join(contentRoot, "annotations");
const registryPath = path.join(contentRoot, "annotation-discussions.json");
const collections = ["entries", "field-notes", "build-logs", "fragments", "patterns", "experiments", "graveyard"];
const owner = process.env.ARCHIVE_DISCUSSIONS_OWNER || "Mr-Bolan";
const repo = process.env.ARCHIVE_DISCUSSIONS_REPO || "thebolanarchives";
const repository = `${owner}/${repo}`;
const categorySlug = process.env.ARCHIVE_DISCUSSIONS_CATEGORY || "archive-annotations";
const markerPattern = /<!--\s*archive-discussion:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*-->/i;
const githubOrigin = `https://github.com/${repository}`;
const args = new Set(process.argv.slice(2));

async function main() {
  if (args.has("--self-check")) {
    runSelfCheck();
    return;
  }

  if (args.has("--sync")) {
    await syncDiscussions();
    return;
  }

  if (args.has("--export-clear")) {
    await exportClearAnnotations();
    return;
  }

  console.log("usage: node scripts/archive-discussions.mjs --self-check | --sync | --export-clear");
}

async function syncDiscussions() {
  const records = readPublishableRecords();
  const client = new GitHubClient();
  const { repositoryId, categoryId } = await client.getRepositoryAndCategory();
  const existingDiscussions = await client.listCategoryDiscussions(categoryId);
  const discussionsBySlug = new Map();
  const registry = readRegistry();

  for (const discussion of existingDiscussions) {
    const slug = discussionSlug(discussion.body);

    if (slug) {
      discussionsBySlug.set(slug, discussion);
    }
  }

  const nextRecords = {};

  for (const record of records) {
    let discussion = discussionsBySlug.get(record.slug);

    if (!discussion) {
      discussion = await client.createDiscussion({
        repositoryId,
        categoryId,
        title: discussionTitle(record),
        body: discussionBody(record),
      });
      console.log(`created discussion ${discussion.url} for ${record.slug}`);
    }

    nextRecords[record.slug] = {
      discussionId: discussion.id,
      number: discussion.number,
      url: discussion.url,
      title: discussion.title,
      categorySlug,
    };
  }

  const nextRegistry = {
    version: 1,
    repository,
    categorySlug,
    records: sortObject(nextRecords),
  };

  writeJsonIfChanged(registryPath, nextRegistry);

  const missingFromRegistry = records.filter((record) => !registry.records?.[record.slug]).length;
  console.log(
    `archive discussions: synced ${records.length} record discussion${records.length === 1 ? "" : "s"} (${missingFromRegistry} new to registry)`,
  );
}

async function exportClearAnnotations() {
  const records = readPublishableRecords();
  const recordsBySlug = new Map(records.map((record) => [record.slug, record]));
  const registry = readRegistry();
  const entries = Object.entries(registry.records ?? {}).sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    throw new Error("content/annotation-discussions.json has no record discussions. Run npm run discussions:sync first.");
  }

  const client = new GitHubClient();
  const exportedBySlug = new Map();
  const summary = {
    scanned: 0,
    clear: 0,
    blocked: 0,
    needsReview: 0,
    invalidTarget: 0,
    ignored: 0,
  };

  for (const [discussionSlug, discussion] of entries) {
    const record = recordsBySlug.get(discussionSlug);

    if (!record) {
      summary.invalidTarget += 1;
      console.warn(`screen_invalid_target: ${discussionSlug} is not a public or unlisted archive record`);
      continue;
    }

    const comments = await client.listDiscussionComments(discussion.number);
    const clearAnnotations = [];

    for (const comment of comments) {
      summary.scanned += 1;

      if (isBotScreeningComment(comment.body)) {
        summary.ignored += 1;
        continue;
      }

      const note = parsePreparedNote(comment.body);
      const screen = screenNote(note, { discussionSlug, record, recordsBySlug });

      if (screen.state === "screen_clear") {
        clearAnnotations.push(annotationFromComment({ note, comment, discussion }));
        summary.clear += 1;
        continue;
      }

      if (screen.state === "screen_blocked") {
        summary.blocked += 1;
      } else if (screen.state === "screen_needs_review") {
        summary.needsReview += 1;
      } else {
        summary.invalidTarget += 1;
      }

      console.warn(`${screen.state}: ${comment.url} (${screen.reason})`);
    }

    exportedBySlug.set(discussionSlug, {
      discussion,
      annotations: clearAnnotations,
    });
  }

  for (const [recordSlug, exportResult] of exportedBySlug) {
    mergeGeneratedAnnotations(recordSlug, exportResult.discussion, exportResult.annotations);
  }

  console.log(
    [
      `archive discussions: scanned ${summary.scanned} comment${summary.scanned === 1 ? "" : "s"}`,
      `screen_clear ${summary.clear}`,
      `screen_needs_review ${summary.needsReview}`,
      `screen_blocked ${summary.blocked}`,
      `screen_invalid_target ${summary.invalidTarget}`,
      `ignored ${summary.ignored}`,
    ].join(", "),
  );
}

class GitHubClient {
  constructor() {
    this.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    if (!this.token) {
      throw new Error("GITHUB_TOKEN or GH_TOKEN is required for GitHub discussion sync/export.");
    }
  }

  async getRepositoryAndCategory() {
    const data = await this.graphql(
      `query RepositoryCategory($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
          hasDiscussionsEnabled
          discussionCategories(first: 100) {
            nodes {
              id
              name
              slug
            }
          }
        }
      }`,
      { owner, repo },
    );
    const repositoryData = data.repository;
    const category = repositoryData?.discussionCategories?.nodes?.find((node) => node.slug === categorySlug);

    if (!repositoryData?.hasDiscussionsEnabled) {
      throw new Error(`GitHub Discussions are not enabled for ${repository}.`);
    }

    if (!category) {
      const available = repositoryData.discussionCategories.nodes.map((node) => node.slug).sort().join(", ") || "none";
      throw new Error(
        `GitHub discussion category "${categorySlug}" is missing. Available categories: ${available}. Create "${categorySlug}" in ${githubOrigin}/discussions/categories before syncing.`,
      );
    }

    return {
      repositoryId: repositoryData.id,
      categoryId: category.id,
    };
  }

  async listCategoryDiscussions(categoryId) {
    const discussions = [];
    let cursor = null;

    do {
      const data = await this.graphql(
        `query CategoryDiscussions($owner: String!, $repo: String!, $categoryId: ID!, $cursor: String) {
          repository(owner: $owner, name: $repo) {
            discussions(first: 100, after: $cursor, categoryId: $categoryId) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                number
                url
                title
                body
              }
            }
          }
        }`,
        { owner, repo, categoryId, cursor },
      );
      const page = data.repository.discussions;
      discussions.push(...page.nodes);
      cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    } while (cursor);

    return discussions;
  }

  async createDiscussion({ repositoryId, categoryId, title, body }) {
    const data = await this.graphql(
      `mutation CreateArchiveDiscussion($input: CreateDiscussionInput!) {
        createDiscussion(input: $input) {
          discussion {
            id
            number
            url
            title
            body
          }
        }
      }`,
      {
        input: {
          repositoryId,
          categoryId,
          title,
          body,
        },
      },
    );

    return data.createDiscussion.discussion;
  }

  async listDiscussionComments(number) {
    const comments = [];
    let cursor = null;

    do {
      const data = await this.graphql(
        `query DiscussionComments($owner: String!, $repo: String!, $number: Int!, $cursor: String) {
          repository(owner: $owner, name: $repo) {
            discussion(number: $number) {
              comments(first: 100, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  url
                  body
                  createdAt
                  author {
                    login
                  }
                }
              }
            }
          }
        }`,
        { owner, repo, number, cursor },
      );
      const discussion = data.repository.discussion;

      if (!discussion) {
        return comments;
      }

      const page = discussion.comments;
      comments.push(...page.nodes);
      cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    } while (cursor);

    return comments;
  }

  async graphql(query, variables) {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
        "user-agent": "thebolanarchives-archive-discussions",
      },
      body: JSON.stringify({ query, variables }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(`GitHub GraphQL request failed (${response.status}): ${JSON.stringify(payload)}`);
    }

    if (payload.errors?.length) {
      throw new Error(`GitHub GraphQL error: ${payload.errors.map((error) => error.message).join("; ")}`);
    }

    return payload.data;
  }
}

function readPublishableRecords() {
  return readRecords()
    .filter((record) => record.visibility !== "draft")
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function readRecords() {
  const records = [];

  for (const folder of collections) {
    const directory = path.join(contentRoot, folder);

    if (!existsSync(directory)) {
      continue;
    }

    for (const file of readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
      const filePath = path.join(directory, file);
      const source = readFileSync(filePath, "utf8");
      const slug = frontmatterValue(source, "slug") || file.replace(/\.mdx$/, "");
      const title = frontmatterValue(source, "title") || slug;
      const visibility = frontmatterValue(source, "visibility") || "draft";
      const body = stripLeadingHeading(stripFrontmatter(source));

      records.push({
        slug,
        title,
        visibility,
        folder,
        route: `/${folder}/${slug}`,
        headingIds: headingIds(body),
        paragraphCount: paragraphCount(body),
      });
    }
  }

  return records;
}

function readRegistry() {
  if (!existsSync(registryPath)) {
    return {
      version: 1,
      repository,
      categorySlug,
      records: {},
    };
  }

  const data = JSON.parse(readFileSync(registryPath, "utf8"));

  if (!data.records || typeof data.records !== "object" || Array.isArray(data.records)) {
    throw new Error("content/annotation-discussions.json must contain a records object.");
  }

  return data;
}

function discussionSlug(body) {
  const match = body.match(markerPattern);
  return match?.[1] ?? "";
}

function discussionTitle(record) {
  return `[archive annotations] ${record.slug}`;
}

function discussionBody(record) {
  return [
    `<!-- archive-discussion: ${record.slug} -->`,
    "",
    "# archive annotation thread",
    "",
    `record: ${record.title}`,
    `slug: \`${record.slug}\``,
    `route: \`${record.route}\``,
    "",
    "Leave notes for this archive record as replies in this discussion.",
    "The public site reads only screened exports from this thread; GitHub remains the visible source of the note.",
    "",
    "Paste prepared notes in this shape:",
    "",
    "```text",
    "target record slug:",
    record.slug,
    "",
    "target anchor ID:",
    "p-1",
    "",
    "short excerpt:",
    "optional short passage clue",
    "",
    "note body:",
    "the note",
    "",
    "display name / pseudonym:",
    "anonymous reader",
    "```",
    "",
    "Do not include private data, credentials, private URLs, identifying details, or unsupported claims.",
  ].join("\n");
}

function parsePreparedNote(body) {
  const fields = {
    recordSlug: "",
    anchorId: "",
    excerpt: "",
    body: "",
    author: "",
  };
  const aliases = new Map([
    ["target record slug", "recordSlug"],
    ["target-record-slug", "recordSlug"],
    ["record slug", "recordSlug"],
    ["target anchor id", "anchorId"],
    ["target anchor ID", "anchorId"],
    ["target-anchor-id", "anchorId"],
    ["anchor id", "anchorId"],
    ["short excerpt", "excerpt"],
    ["excerpt", "excerpt"],
    ["note body", "body"],
    ["body", "body"],
    ["display name / pseudonym", "author"],
    ["display name", "author"],
    ["pseudonym", "author"],
    ["github intake draft", "_ignore"],
    ["github record discussion", "_ignore"],
    ["public submission checks", "_ignore"],
  ]);
  let currentKey = "";

  for (const line of body.split(/\r?\n/)) {
    const key = aliases.get(normalizeLabelLine(line));

    if (key) {
      if (key === "_ignore") {
        currentKey = "";
        continue;
      }

      currentKey = key;

      if (fields[currentKey]) {
        fields[currentKey] += "\n";
      }

      continue;
    }

    if (currentKey) {
      fields[currentKey] += `${line}\n`;
    }
  }

  return {
    recordSlug: cleanField(fields.recordSlug),
    anchorId: cleanField(fields.anchorId),
    excerpt: cleanField(fields.excerpt),
    body: cleanField(fields.body),
    author: cleanField(fields.author),
  };
}

function screenNote(note, { discussionSlug, record, recordsBySlug }) {
  if (!note.recordSlug || !note.anchorId || !note.body) {
    return { state: "screen_invalid_target", reason: "missing record slug, anchor id, or note body" };
  }

  if (note.recordSlug !== discussionSlug) {
    return { state: "screen_invalid_target", reason: `record slug "${note.recordSlug}" does not match discussion "${discussionSlug}"` };
  }

  const targetRecord = recordsBySlug.get(note.recordSlug);

  if (!targetRecord || targetRecord.visibility === "draft") {
    return { state: "screen_invalid_target", reason: `record "${note.recordSlug}" is not published or unlisted` };
  }

  const anchorResult = validateAnchor(note.anchorId, record);

  if (!anchorResult.ok) {
    return { state: "screen_invalid_target", reason: anchorResult.reason };
  }

  if (note.body.length < 12 || note.body.length > 1000) {
    return { state: "screen_needs_review", reason: "note body is outside archive marginalia length" };
  }

  if (note.excerpt.length > 280) {
    return { state: "screen_needs_review", reason: "excerpt is longer than the archive display limit" };
  }

  if (note.author.length > 80) {
    return { state: "screen_needs_review", reason: "display name is too long" };
  }

  const privateHit = privateTextHit(note);

  if (privateHit) {
    return { state: "screen_blocked", reason: `contains ${privateHit}` };
  }

  const spamHit = spamTextHit(note.body);

  if (spamHit) {
    return { state: "screen_blocked", reason: `looks like spam or promotion (${spamHit})` };
  }

  const reviewHit = reviewTextHit(note.body);

  if (reviewHit) {
    return { state: "screen_needs_review", reason: `needs human context check (${reviewHit})` };
  }

  return { state: "screen_clear", reason: "clear" };
}

function annotationFromComment({ note, comment, discussion }) {
  return {
    id: `gh_discussion_${discussion.number}_${hash(comment.id).slice(0, 12)}`,
    recordSlug: note.recordSlug,
    anchorId: note.anchorId,
    label: "reader note",
    body: note.body,
    author: note.author || "anonymous reader",
    created: new Date(comment.createdAt).toISOString().slice(0, 10),
    status: "approved",
    ...(note.excerpt ? { excerpt: note.excerpt } : {}),
    sourceUrl: comment.url,
  };
}

function mergeGeneratedAnnotations(recordSlug, discussion, generatedAnnotations) {
  const filePath = path.join(annotationsRoot, `${recordSlug}.json`);
  const existing = existsSync(filePath) ? JSON.parse(readFileSync(filePath, "utf8")) : [];

  if (!Array.isArray(existing)) {
    throw new Error(`${relative(filePath)} must be a JSON array before discussion export can merge into it.`);
  }

  const generatedPrefix = `gh_discussion_${discussion.number}_`;
  const retained = existing.filter((annotation) => {
    if (typeof annotation?.id !== "string") {
      return true;
    }

    return !annotation.id.startsWith(generatedPrefix);
  });
  const next = [...retained, ...generatedAnnotations].sort(compareAnnotations);

  if (next.length === 0 && !existsSync(filePath)) {
    return;
  }

  mkdirSync(annotationsRoot, { recursive: true });
  writeJsonIfChanged(filePath, next);
}

function writeJsonIfChanged(filePath, data) {
  const next = `${JSON.stringify(data, null, 2)}\n`;
  const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";

  if (current === next) {
    console.log(`${relative(filePath)} unchanged`);
    return false;
  }

  writeFileSync(filePath, next);
  console.log(`${relative(filePath)} updated`);
  return true;
}

function validateAnchor(anchorId, record) {
  const paragraph = anchorId.match(/^p-(\d+)$/);

  if (paragraph) {
    const number = Number(paragraph[1]);

    if (number < 1 || number > record.paragraphCount) {
      return { ok: false, reason: `anchor "${anchorId}" is outside p-1..p-${record.paragraphCount}` };
    }

    return { ok: true };
  }

  if (!record.headingIds.has(anchorId)) {
    return { ok: false, reason: `anchor "${anchorId}" does not match a record heading` };
  }

  return { ok: true };
}

function privateTextHit(note) {
  const text = [note.recordSlug, note.anchorId, note.excerpt, note.body, note.author].join("\n");
  const checks = [
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "an email address"],
    [/https?:\/\//i, "a URL"],
    [/\b(localhost|127\.0\.0\.1|10\.\d{1,3}\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i, "a private host"],
    [/\b(password|passwd|api[_-]?key|secret|token|bearer)\b/i, "a credential term"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
    [/\b(AKIA|ASIA)[A-Z0-9]{16}\b/, "an AWS access key"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/, "an API key"],
    [/\b(TODO|TBD|CHANGEME|REPLACE_ME|FIXME)\b/i, "placeholder text"],
  ];

  return checks.find(([pattern]) => pattern.test(text))?.[1] ?? "";
}

function spamTextHit(text) {
  const checks = [
    [/\b(casino|crypto|airdrop|loan|viagra|seo|backlink|followers|telegram|whatsapp)\b/i, "promo term"],
    [/(.)\1{12,}/, "repeated character run"],
    [/\b(buy now|limited offer|work from home|guaranteed income)\b/i, "ad phrase"],
  ];

  return checks.find(([pattern]) => pattern.test(text))?.[1] ?? "";
}

function reviewTextHit(text) {
  const checks = [
    [/\b(kill|suicide|self-harm|blood|weapon|explosive)\b/i, "safety-sensitive term"],
    [/\b(hate|racist|slur|sexual|explicit)\b/i, "abuse-sensitive term"],
    [/\b(i know who|real name|address|phone number)\b/i, "possible identifying claim"],
  ];

  return checks.find(([pattern]) => pattern.test(text))?.[1] ?? "";
}

function isBotScreeningComment(body) {
  return /<!--\s*archive-screen:/i.test(body) || /^screen_(clear|needs_review|blocked|invalid_target)\b/i.test(body.trim());
}

function normalizeLabelLine(line) {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim()
    .replace(/:$/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function cleanField(value) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```(?:text|markdown)?/gi, "")
    .replace(/```/g, "")
    .trim();
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

function frontmatterValue(source, key) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return "";

  const field = match[1].match(new RegExp(`^${key}:\\s*["']?([^"'\r\n]+)["']?\\s*$`, "m"));
  return field ? field[1].trim() : "";
}

function stripFrontmatter(source) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

function stripLeadingHeading(source) {
  return source.replace(/^#\s+.*(?:\r?\n)+/, "").trim();
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

function compareAnnotations(a, b) {
  const created = String(a.created ?? "").localeCompare(String(b.created ?? ""));

  if (created !== 0) {
    return created;
  }

  return String(a.id ?? "").localeCompare(String(b.id ?? ""));
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function runSelfCheck() {
  const record = {
    slug: "why-this-exists",
    title: "why this exists",
    visibility: "public",
    folder: "entries",
    route: "/entries/why-this-exists",
    headingIds: new Set(["what-this-is"]),
    paragraphCount: 2,
  };
  const recordsBySlug = new Map([[record.slug, record]]);
  const body = [
    "target record slug:",
    "why-this-exists",
    "",
    "target anchor ID:",
    "p-1",
    "",
    "short excerpt:",
    "This archive is not a portfolio.",
    "",
    "note body:",
    "This note is specific enough to survive screening.",
    "",
    "display name / pseudonym:",
    "anonymous reader",
    "",
    "GitHub record discussion:",
    `${githubOrigin}/discussions/1`,
  ].join("\n");
  const note = parsePreparedNote(body);
  const screen = screenNote(note, { discussionSlug: "why-this-exists", record, recordsBySlug });
  const annotation = annotationFromComment({
    note,
    comment: {
      id: "DIC_kw_sample",
      url: `${githubOrigin}/discussions/1#discussioncomment-1`,
      createdAt: "2026-06-16T00:00:00Z",
      body,
      author: { login: "reader" },
    },
    discussion: {
      number: 1,
      url: `${githubOrigin}/discussions/1`,
      title: "[archive annotations] why-this-exists",
    },
  });

  assert.equal(note.recordSlug, "why-this-exists");
  assert.equal(note.anchorId, "p-1");
  assert.equal(note.author, "anonymous reader");
  assert.equal(screen.state, "screen_clear");
  assert.equal(annotation.recordSlug, "why-this-exists");
  assert.equal(annotation.status, "approved");
  assert.match(annotation.sourceUrl, /discussions\/1#discussioncomment-1$/);
  assert.equal(discussionSlug(discussionBody(record)), "why-this-exists");

  const blocked = screenNote(
    { ...note, body: "Email me at person@example.com for this secret token" },
    { discussionSlug: "why-this-exists", record, recordsBySlug },
  );
  assert.equal(blocked.state, "screen_blocked");

  console.log("archive discussions self-check: ok");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
