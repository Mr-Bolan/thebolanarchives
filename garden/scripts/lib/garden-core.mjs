// Shared helpers for the garden operating-layer scripts. Kept small and dependency-free.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const root = path.resolve(process.cwd());

// content type -> folder, matching docs/content-model.md
export const COLLECTIONS = [
  { type: "entry", folder: "entries", route: "/entries" },
  { type: "field_note", folder: "field-notes", route: "/field-notes" },
  { type: "build_log", folder: "build-logs", route: "/build-logs" },
  { type: "fragment", folder: "fragments", route: "/fragments" },
  { type: "pattern", folder: "patterns", route: "/patterns" },
  { type: "experiment", folder: "experiments", route: "/experiments" },
  { type: "graveyard_note", folder: "graveyard", route: "/graveyard" },
];

export const gardenStateDir = path.join(root, "garden", "state");
export const backlogPath = path.join(gardenStateDir, "backlog.json");

// Minimal YAML-frontmatter parser: scalars + inline/block string arrays.
// Mirrors the subset used by scripts/content-audit.mjs and src/lib/content.ts.
export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const data = {};
  let currentKey = null;

  for (const line of lines) {
    if (/^\s+-\s+/.test(line) && currentKey) {
      const value = line.replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, "");
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(value);
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const rawValue = kv[2].trim();
    currentKey = key;
    if (rawValue === "") {
      data[key] = [];
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
  return data;
}

export function readContentRecords() {
  const records = [];
  for (const collection of COLLECTIONS) {
    const dir = path.join(root, "content", collection.folder);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const filePath = path.join(dir, file);
      const fm = parseFrontmatter(readFileSync(filePath, "utf8"));
      records.push({
        slug: fm.slug ?? path.basename(file, ".mdx"),
        type: fm.type ?? collection.type,
        status: fm.status ?? null,
        confidence: fm.confidence ?? null,
        visibility: fm.visibility ?? "draft",
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      related: Array.isArray(fm.related) ? fm.related : [],
      points: Array.isArray(fm.points) ? fm.points : [],
      series: typeof fm.series === "string" ? fm.series : null,
      sequence: fm.sequence !== undefined ? Number(fm.sequence) : null,
      collection: collection.folder,
      route: `${collection.route}/${fm.slug ?? path.basename(file, ".mdx")}`,
      file: path.relative(root, filePath).replace(/\\/g, "/"),
    });
    }
  }
  return records;
}

// Build the archive graph (records + tags as nodes; related/tag/series edges) from records.
// Kept in lockstep with src/lib/graph.ts buildArchiveGraph; the route uses the TS version,
// the prebuild uses this to emit public/archive-graph.json.
export function buildArchiveGraphFromRecords(records) {
  const recordSlugs = new Set(records.map((r) => r.slug));
  const nodes = new Map();
  const edgeKeys = new Set();
  const edges = [];

  const addEdge = (source, target, kind) => {
    if (source === target) return;
    const [a, b] = [source, target].sort();
    const key = `${kind}:${a}|${b}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target, kind });
  };

  for (const r of records) {
    nodes.set(`record:${r.slug}`, {
      id: `record:${r.slug}`,
      kind: "record",
      label: r.title ?? r.slug,
      degree: 0,
      route: r.route,
      type: r.type,
      status: r.status,
      slug: r.slug,
    });
  }

  for (const r of records) {
    const fromId = `record:${r.slug}`;
    for (const related of r.related) {
      if (recordSlugs.has(related)) addEdge(fromId, `record:${related}`, "related");
    }
    for (const tag of r.tags) {
      const tagId = `tag:${tag}`;
      if (!nodes.has(tagId)) {
        nodes.set(tagId, { id: tagId, kind: "tag", label: tag, degree: 0, tag });
      }
      addEdge(fromId, tagId, "tag");
    }
  }

  const bySeries = new Map();
  for (const r of records) {
    if (!r.series) continue;
    const group = bySeries.get(r.series) ?? [];
    group.push(r);
    bySeries.set(r.series, group);
  }
  for (const group of bySeries.values()) {
    const ordered = [...group].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    for (let i = 0; i < ordered.length - 1; i += 1) {
      addEdge(`record:${ordered[i].slug}`, `record:${ordered[i + 1].slug}`, "series");
    }
  }

  for (const edge of edges) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (source) source.degree += 1;
    if (target) target.degree += 1;
  }

  return { nodes: [...nodes.values()], edges };
}

export function readBacklog() {
  if (!existsSync(backlogPath)) {
    return { version: 1, items: [] };
  }
  return JSON.parse(readFileSync(backlogPath, "utf8"));
}

export function listDir(relDir, filter = () => true) {
  const dir = path.join(root, relDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => filter(entry))
    .map((entry) => entry.name);
}

export function walkFiles(relDir, predicate = () => true) {
  const out = [];
  const base = path.join(root, relDir);
  if (!existsSync(base)) return out;
  const stack = [base];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (predicate(full)) {
        out.push(path.relative(root, full).replace(/\\/g, "/"));
      }
    }
  }
  return out;
}

export function gitShortSha() {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function isFile(relPath) {
  const full = path.join(root, relPath);
  return existsSync(full) && statSync(full).isFile();
}
