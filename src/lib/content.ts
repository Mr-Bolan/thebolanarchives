import fs from "node:fs";
import path from "node:path";

const contentRoot = path.join(process.cwd(), "content");

export const COLLECTIONS = {
  entries: {
    type: "entry",
    route: "/entries",
    label: "entries",
    description: "Longer archive articles, explanations, and retrospective records.",
  },
  "field-notes": {
    type: "field_note",
    route: "/field-notes",
    label: "field notes",
    description: "Observed behavior from machines, workflows, data, and real systems.",
  },
  "build-logs": {
    type: "build_log",
    route: "/build-logs",
    label: "build logs",
    description: "Records of tools, scripts, prototypes, and systems while they are being made.",
  },
  fragments: {
    type: "fragment",
    route: "/fragments",
    label: "fragments",
    description: "Small thoughts and rough edges that may grow into larger records.",
  },
  patterns: {
    type: "pattern",
    route: "/patterns",
    label: "patterns",
    description: "Reusable ways of seeing systems, assumptions, and operational behavior.",
  },
  experiments: {
    type: "experiment",
    route: "/experiments",
    label: "experiments",
    description: "Static explanations and future instruments for testing archive ideas.",
  },
  graveyard: {
    type: "graveyard_note",
    route: "/graveyard",
    label: "graveyard",
    description: "Retired, failed, abandoned, or replaced work kept for the record.",
  },
} as const;

export const COLLECTION_FOLDERS = Object.keys(COLLECTIONS) as CollectionFolder[];

const statuses = [
  "fragment",
  "sketch",
  "working_note",
  "field_tested",
  "stable_artefact",
  "retired",
] as const;

const confidences = ["low", "partial", "medium", "high", "field_confirmed"] as const;
const visibilities = ["public", "unlisted", "draft"] as const;
const externalLinkKinds = ["repository", "demo", "documentation", "related-site", "artifact"] as const;

export type CollectionFolder = keyof typeof COLLECTIONS;
export type ContentType = (typeof COLLECTIONS)[CollectionFolder]["type"];
export type ContentStatus = (typeof statuses)[number];
export type ContentConfidence = (typeof confidences)[number];
export type ContentVisibility = (typeof visibilities)[number];
export type ExternalLinkKind = (typeof externalLinkKinds)[number];
export type ExternalLink = {
  label: string;
  url: string;
  kind: ExternalLinkKind;
};

export type ArchiveItem = {
  title: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  confidence: ContentConfidence;
  summary: string;
  created: string;
  updated: string;
  tags: string[];
  tools: string[];
  narrative_origin: string;
  visibility: ContentVisibility;
  related: string[];
  external_links?: ExternalLink[];
  folder: CollectionFolder;
  route: string;
  record_id?: string;
  series?: string;
  sequence?: number;
  last_verified?: string;
  source_context?: string;
  aliases?: string[];
};

export type ContentItem = ArchiveItem & {
  body: string;
};

type FrontmatterObject = Record<string, string | number | string[]>;
type Frontmatter = Record<string, string | number | string[] | FrontmatterObject[]>;

let contentCache: ContentItem[] | undefined;
const relatedWarnings = new Set<string>();

export function getAllContent(): ContentItem[] {
  if (!contentCache) {
    contentCache = COLLECTION_FOLDERS.flatMap((folder) => readCollection(folder))
      .filter((item) => item.visibility !== "draft")
      .sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title));

    reportMissingRelatedSlugs(contentCache);
  }

  return contentCache;
}

export function getAllArchiveItems(): ArchiveItem[] {
  return getListedContent().map(stripBody);
}

export function getRecentContent(limit = 5): ContentItem[] {
  return getListedContent().slice(0, limit);
}

export function getListedContent(): ContentItem[] {
  return getAllContent().filter(isPublicRecord);
}

export function getCollectionContent(folder: CollectionFolder): ContentItem[] {
  return getAllContent().filter((item) => item.folder === folder);
}

export function getCollectionArchiveItems(folder: CollectionFolder): ArchiveItem[] {
  return getCollectionContent(folder).filter(isPublicRecord).map(stripBody);
}

export function getContentBySlug(slug: string): ContentItem | undefined {
  return getAllContent().find((item) => item.slug === slug);
}

export function getContentByFolderAndSlug(folder: CollectionFolder, slug: string): ContentItem | undefined {
  return getCollectionContent(folder).find((item) => item.slug === slug);
}

export function getStaticParamsForCollection(folder: CollectionFolder): Array<{ slug: string }> {
  return getCollectionContent(folder).map((item) => ({ slug: item.slug }));
}

export function getRelatedContent(item: ArchiveItem): ArchiveItem[] {
  if (item.related.length === 0) {
    return [];
  }

  const bySlug = new Map(getAllContent().map((record) => [record.slug, record]));

  return item.related.flatMap((slug) => {
    const related = bySlug.get(slug);

    if (!related) {
      warnMissingRelated(item, slug);
      return [];
    }

    return [stripBody(related)];
  });
}

export function getArchiveYears(items: ArchiveItem[] = getAllArchiveItems()): string[] {
  return uniqueSorted(items.map((item) => item.created.slice(0, 4))).sort((a, b) => b.localeCompare(a));
}

export function getArchiveTags(items: ArchiveItem[] = getAllArchiveItems()): string[] {
  return uniqueSorted(items.flatMap((item) => item.tags));
}

export function getArchiveTools(items: ArchiveItem[] = getAllArchiveItems()): string[] {
  return uniqueSorted(items.flatMap((item) => item.tools));
}

function readCollection(folder: CollectionFolder): ContentItem[] {
  const directory = path.join(contentRoot, folder);

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readContentFile(folder, file));
}

function readContentFile(folder: CollectionFolder, file: string): ContentItem {
  const filePath = path.join(contentRoot, folder, file);
  const slug = file.replace(/\.mdx$/, "");
  const source = fs.readFileSync(filePath, "utf8");
  const { body, data } = parseFrontmatter(source, filePath);
  const collection = COLLECTIONS[folder];

  const item: ContentItem = {
    title: stringField(data, "title", filePath),
    slug: stringField(data, "slug", filePath),
    type: enumField(data, "type", [collection.type], filePath),
    status: enumField(data, "status", statuses, filePath),
    confidence: enumField(data, "confidence", confidences, filePath),
    summary: stringField(data, "summary", filePath),
    created: dateField(data, "created", filePath),
    updated: dateField(data, "updated", filePath),
    tags: stringArrayField(data, "tags", filePath),
    tools: stringArrayField(data, "tools", filePath),
    narrative_origin: stringField(data, "narrative_origin", filePath),
    visibility: enumField(data, "visibility", visibilities, filePath),
    related: stringArrayField(data, "related", filePath),
    external_links: optionalExternalLinksField(data, "external_links", filePath),
    body,
    folder,
    route: `${collection.route}/${slug}`,
    record_id: optionalStringField(data, "record_id", filePath),
    series: optionalStringField(data, "series", filePath),
    sequence: optionalNumberField(data, "sequence", filePath),
    last_verified: optionalDateField(data, "last_verified", filePath),
    source_context: optionalStringField(data, "source_context", filePath),
    aliases: optionalStringArrayField(data, "aliases", filePath),
  };

  if (!isKebabCase(item.slug)) {
    throw new Error(`${filePath}: slug must be lowercase kebab-case`);
  }

  if (item.slug !== slug) {
    throw new Error(`${filePath}: slug must match filename`);
  }

  if (item.updated < item.created) {
    throw new Error(`${filePath}: updated must be the same as or later than created`);
  }

  if (item.visibility !== "draft" && item.tags.length === 0) {
    throw new Error(`${filePath}: public and unlisted content must have at least one tag`);
  }

  const invalidTag = item.tags.find((tag) => !isKebabCase(tag));
  if (invalidTag) {
    throw new Error(`${filePath}: tag "${invalidTag}" must be lowercase kebab-case`);
  }

  if (item.related.includes(item.slug)) {
    throw new Error(`${filePath}: related must not include the current slug`);
  }

  if (item.confidence === "field_confirmed" && !item.last_verified && !item.source_context && !hasBodyEvidence(item.body)) {
    throw new Error(`${filePath}: field_confirmed content needs evidence metadata or body evidence`);
  }

  return item;
}

function parseFrontmatter(source: string, filePath: string): { data: Frontmatter; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    throw new Error(`${filePath}: missing frontmatter`);
  }

  const data: Frontmatter = {};
  let currentKey: string | undefined;
  let currentObjectKey: string | undefined;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      continue;
    }

    const objectListItem = line.match(/^\s*-\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (objectListItem && currentKey) {
      const value = data[currentKey];
      const item = { [objectListItem[1]]: cleanValue(objectListItem[2] ?? "") };
      data[currentKey] = Array.isArray(value) ? [...(value as FrontmatterObject[]), item] : [item];
      currentObjectKey = currentKey;
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      const value = data[currentKey];
      data[currentKey] = Array.isArray(value) ? [...(value as string[]), cleanScalar(listItem[1])] : [cleanScalar(listItem[1])];
      currentObjectKey = undefined;
      continue;
    }

    const nestedField = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (nestedField && currentKey && currentObjectKey === currentKey) {
      const value = data[currentKey];
      const last = Array.isArray(value) ? value[value.length - 1] : undefined;

      if (!isFrontmatterObject(last)) {
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

function cleanValue(value: string): string | number | string[] {
  if (value === "" || value === "[]") {
    return [];
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  return cleanScalar(value);
}

function cleanScalar(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function stringField(data: Frontmatter, key: string, filePath: string): string {
  const value = data[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${filePath}: ${key} must be a string`);
  }

  return value;
}

function optionalStringField(data: Frontmatter, key: string, filePath: string): string | undefined {
  const value = data[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${filePath}: ${key} must be a string`);
  }

  return value;
}

function optionalNumberField(data: Frontmatter, key: string, filePath: string): number | undefined {
  const value = data[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number") {
    throw new Error(`${filePath}: ${key} must be a number`);
  }

  return value;
}

function stringArrayField(data: Frontmatter, key: string, filePath: string): string[] {
  const value = data[key];

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${filePath}: ${key} must be a string array`);
  }

  return value;
}

function optionalStringArrayField(data: Frontmatter, key: string, filePath: string): string[] | undefined {
  const value = data[key];

  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${filePath}: ${key} must be a string array`);
  }

  return value;
}

function optionalExternalLinksField(data: Frontmatter, key: string, filePath: string): ExternalLink[] | undefined {
  const value = data[key];

  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${filePath}: ${key} must be an array`);
  }

  return value.map((link, index) => {
    if (!isFrontmatterObject(link)) {
      throw new Error(`${filePath}: ${key}[${index}] must be an object`);
    }

    const label = objectStringField(link, "label", `${filePath}: ${key}[${index}]`);
    const url = objectStringField(link, "url", `${filePath}: ${key}[${index}]`);
    const kind = objectEnumField(link, "kind", externalLinkKinds, `${filePath}: ${key}[${index}]`);

    assertPublicUrl(url, `${filePath}: ${key}[${index}].url`);

    return { label, url, kind };
  });
}

function enumField<const T extends readonly string[]>(
  data: Frontmatter,
  key: string,
  allowed: T,
  filePath: string,
): T[number] {
  const value = stringField(data, key, filePath);

  if (!allowed.includes(value)) {
    throw new Error(`${filePath}: ${key} must be one of ${allowed.join(", ")}`);
  }

  return value;
}

function dateField(data: Frontmatter, key: string, filePath: string): string {
  const value = stringField(data, key, filePath);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${filePath}: ${key} must use YYYY-MM-DD`);
  }

  return value;
}

function objectStringField(data: FrontmatterObject, key: string, filePath: string): string {
  const value = data[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${filePath}: ${key} must be a string`);
  }

  return value;
}

function objectEnumField<const T extends readonly string[]>(
  data: FrontmatterObject,
  key: string,
  allowed: T,
  filePath: string,
): T[number] {
  const value = objectStringField(data, key, filePath);

  if (!allowed.includes(value)) {
    throw new Error(`${filePath}: ${key} must be one of ${allowed.join(", ")}`);
  }

  return value;
}

function assertPublicUrl(value: string, filePath: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    throw new Error(`${filePath} must be a public http or https URL`);
  }
}

function isFrontmatterObject(value: unknown): value is FrontmatterObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalDateField(data: Frontmatter, key: string, filePath: string): string | undefined {
  const value = data[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${filePath}: ${key} must use YYYY-MM-DD`);
  }

  return value;
}

function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function stripBody({ body: _body, ...item }: ContentItem): ArchiveItem {
  return item;
}

function isPublicRecord(item: Pick<ArchiveItem, "visibility">): boolean {
  return item.visibility === "public";
}

function reportMissingRelatedSlugs(items: ContentItem[]) {
  const slugs = new Set(items.map((item) => item.slug));

  for (const item of items) {
    for (const slug of item.related) {
      if (!slugs.has(slug)) {
        warnMissingRelated(item, slug);
      }
    }
  }
}

function warnMissingRelated(item: Pick<ArchiveItem, "slug" | "related">, missingSlug: string) {
  const message = `content warning: ${item.slug} references related slug "${missingSlug}", but it does not resolve to published content; the link will be omitted`;

  if (relatedWarnings.has(message)) {
    return;
  }

  relatedWarnings.add(message);
  console.warn(message);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function hasBodyEvidence(body: string): boolean {
  return /\b(evidence|verified|observed|measured|field confirmed|source)\b/i.test(body);
}
