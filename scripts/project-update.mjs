#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const buildLogsRoot = path.join(root, "content", "build-logs");
let args = parseArgs(process.argv.slice(2));

if (args["self-check"]) {
  runSelfCheck();
  process.exit(0);
}

if (args["validate-checkin"]) {
  validateCheckinFile();
  process.exit(0);
}

if (args["validate-project-list"]) {
  validateProjectList();
  process.exit(0);
}

if (args["write-checkin"]) {
  writeCheckinTemplate();
  process.exit(0);
}

if (args["install-checkin"]) {
  installCheckinInstructions();
  process.exit(0);
}

if (args["write-project-list"]) {
  writeProjectListTemplate();
  process.exit(0);
}

if (args["install-project-list"]) {
  installProjectList();
  process.exit(0);
}

if (args["import-project-list"]) {
  importProjectList();
  process.exit(0);
}

if (args["sync-project-list"]) {
  syncProjectList();
  process.exit(0);
}

if (args["check-install"]) {
  checkInstall();
  process.exit(0);
}

if (args["check-project-list"]) {
  checkProjectList();
  process.exit(0);
}

if (args["write-ledger"]) {
  writeProjectLedger();
  process.exit(0);
}

if (args.list) {
  printProjectLedger();
  process.exit(0);
}

if (args["from-json"]) {
  args = argsFromCheckin(args);
}

writeProjectUpdate(args);

function writeProjectUpdate(values) {
  const update = updateInput(values);
  validateUpdate(values, update);

  mkdirSync(buildLogsRoot, { recursive: true });

  if (existsSync(update.filePath)) {
    const source = readFileSync(update.filePath, "utf8");
    const marker = importMarker(values);

    if (alreadyImported(source, values)) {
      console.log(`project update: skipped duplicate ${path.relative(root, update.filePath)}`);
      return;
    }

    writeFileSync(update.filePath, appendUpdate(setUpdated(source, update.today), update.today, markNote(update.note, marker), values.next), "utf8");
    console.log(`project update: appended ${path.relative(root, update.filePath)}`);
  } else {
    writeFileSync(update.filePath, newBuildLog({ args: values, note: markNote(update.note, importMarker(values)), slug: update.slug, today: update.today }), "utf8");
    console.log(`project update: created ${path.relative(root, update.filePath)}`);
  }
}

function newBuildLog({ args, note, slug, today }) {
  const title = requiredArg(args, "title");
  const summary = requiredArg(args, "summary");
  const visibility = args.visibility || "draft";
  const tags = csv(args.tags);
  const tools = csv(args.tools);

  if (!["draft", "unlisted", "public"].includes(visibility)) {
    fail("--visibility must be draft, unlisted, or public");
  }

  if (visibility !== "draft" && tags.length === 0) {
    fail("public and unlisted build logs need --tags");
  }

  return `---
title: "${escapeYaml(title)}"
slug: "${slug}"
type: "build_log"
status: "${args.status || "working_note"}"
confidence: "${args.confidence || "partial"}"
summary: "${escapeYaml(summary)}"
created: "${today}"
updated: "${today}"
tags:${formatArray(tags)}
tools:${formatArray(tools)}
narrative_origin: "${escapeYaml(args.origin || "agent update")}"
visibility: "${visibility}"
related:${formatArray(csv(args.related))}
---

# build_log // ${slug.replaceAll("-", "_")}

## current state

${note.trim()}
${nextMove(args.next)}
`;
}

function appendUpdate(source, today, note, next) {
  const separator = source.endsWith("\n") ? "" : "\n";

  return `${source}${separator}
## update // ${today}

${note.trim()}
${nextMove(next)}
`;
}

function setUpdated(source, today) {
  if (!/^updated:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m.test(source)) {
    fail("existing build log is missing an updated date");
  }

  return source.replace(/^updated:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m, `updated: "${today}"`);
}

function nextMove(value) {
  const text = value?.trim();
  return text ? `\n**next move:** ${text}\n` : "\n";
}

function readNoteFrom(values) {
  if (values.stdin) {
    return readFileSync(0, "utf8");
  }

  return values.note ?? "";
}

function updateInput(values) {
  const slug = requiredArg(values, "slug");
  const note = readNoteFrom(values);
  const today = values.date || new Date().toISOString().slice(0, 10);
  const filePath = path.join(buildLogsRoot, `${slug}.mdx`);

  return { filePath, note, slug, today };
}

function validateUpdate(values, update) {
  assertSlug(update.slug);
  assertDate(update.today, "date");
  assertSafeText([values.title, values.summary, update.note, values.next].filter(Boolean).join("\n"));

  if (!update.note.trim()) {
    fail("missing update note; pass --note or --stdin");
  }

  if (existsSync(update.filePath)) {
    setUpdated(readFileSync(update.filePath, "utf8"), update.today);
  } else {
    newBuildLog({ args: values, note: update.note, slug: update.slug, today: update.today });
  }
}

function argsFromCheckin(values) {
  const checkinFile = values["from-json"];

  if (typeof checkinFile !== "string" || !checkinFile.trim()) {
    fail("--from-json needs a file path");
  }

  const filePath = path.resolve(root, checkinFile);
  let data;

  try {
    data = JSON.parse(readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    fail(`${checkinFile}: ${error.message}`);
  }

  const loaded = normalizeCheckin(data, checkinFile);
  const overrides = { ...values };
  delete overrides["from-json"];

  return { ...loaded, _importId: checkinImportId(loaded), ...overrides };
}

function checkinImportId(values) {
  return createHash("sha256")
    .update(JSON.stringify([values.slug, values.note, values.next, values.title, values.summary]))
    .digest("hex")
    .slice(0, 16);
}

function importMarker(values) {
  return typeof values._importId === "string" && values._importId ? `<!-- project-update:import:${values._importId} -->` : "";
}

function alreadyImported(source, values) {
  const marker = importMarker(values);
  return Boolean(marker && source.includes(marker));
}

function markNote(note, marker) {
  return marker ? `${marker}\n\n${note}` : note;
}

function validateCheckinFile() {
  const checkinFile = args["validate-checkin"];

  if (typeof checkinFile !== "string" || !checkinFile.trim()) {
    fail("--validate-checkin needs a file path");
  }

  validateCheckinImport(checkinFile);
}

function validateCheckinImport(checkinFile) {
  const values = argsFromCheckin({ ...args, "from-json": checkinFile });
  delete values["validate-checkin"];
  delete values["validate-project-list"];
  delete values["import-project-list"];
  const update = updateInput(values);
  validateUpdate(values, update);

  const target = existsSync(update.filePath) ? "existing" : "new";
  console.log(`project update: ${path.relative(root, path.resolve(root, checkinFile))} is importable for ${target} build log ${update.slug}`);
}

function normalizeCheckin(data, filePath) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail(`${filePath}: expected a JSON object`);
  }

  return {
    slug: requiredCheckinString(data.slug, "slug", filePath),
    title: optionalCheckinString(data.title, "title", filePath),
    summary: optionalCheckinString(data.summary, "summary", filePath),
    status: optionalCheckinString(data.status, "status", filePath),
    confidence: optionalCheckinString(data.confidence, "confidence", filePath),
    visibility: optionalCheckinString(data.visibility, "visibility", filePath),
    tags: checkinList(data.tags, "tags", filePath),
    tools: checkinList(data.tools, "tools", filePath),
    related: checkinList(data.related, "related", filePath),
    origin: optionalCheckinString(data.origin, "origin", filePath) || "project check-in",
    note: checkinNote(data, filePath),
    next: optionalCheckinString(data.next_move ?? data.next, "next_move", filePath),
    date: optionalCheckinString(data.date, "date", filePath),
  };
}

function checkinNote(data, filePath) {
  const directNote = optionalCheckinString(data.note, "note", filePath);

  if (directNote) {
    return directNote;
  }

  return [
    checkinSection("current state", data.current_state, filePath),
    checkinSection("what changed", data.changed, filePath),
    checkinSection("what broke or is uncertain", data.uncertain, filePath),
    checkinSection("public-safe evidence", data.public_evidence, filePath),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function checkinSection(label, value, filePath) {
  const text = optionalCheckinString(value, label, filePath);
  return text ? `**${label}:**\n${text}` : "";
}

function requiredCheckinString(value, key, filePath) {
  const text = optionalCheckinString(value, key, filePath);

  if (!text) {
    fail(`${filePath}: missing ${key}`);
  }

  return text;
}

function optionalCheckinString(value, key, filePath) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    fail(`${filePath}: ${key} must be a string`);
  }

  return value.trim();
}

function checkinList(value, key, filePath) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(`${filePath}: ${key} must be a string array`);
  }

  return value.join(",");
}

function writeCheckinTemplate() {
  const output = args["write-checkin"] === true ? "archive-checkin.json" : args["write-checkin"];

  if (typeof output !== "string" || !output.trim()) {
    fail("--write-checkin needs a file path");
  }

  const filePath = path.resolve(root, output);

  if (existsSync(filePath)) {
    fail(`${output} already exists; refusing to overwrite`);
  }

  const template = checkinTemplate(args);

  assertSlugIfPresent(template.slug, "slug");
  assertVisibility(template.visibility);
  assertSafeText(JSON.stringify(template));
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  console.log(`project update: wrote ${path.relative(root, filePath)}`);
}

function installCheckinInstructions() {
  installCheckinProject(projectDirectoryArg("install-checkin"), true);
}

function writeProjectListTemplate() {
  const filePath = projectListPath("write-project-list");

  if (existsSync(filePath)) {
    fail(`${path.relative(root, filePath)} already exists; refusing to overwrite`);
  }

  writeFileSync(filePath, "# one project directory per line\n# ../some-project\n# sync with: npm run project:update -- --sync-project-list archive-projects.txt\n", "utf8");
  console.log(`project update: wrote ${path.relative(root, filePath)}`);
}

function installProjectList() {
  for (const projectRoot of projectList("install-project-list")) {
    installCheckinProject(projectRoot, false);
  }
}

function validateProjectList() {
  const files = projectCheckinFiles("validate-project-list");

  if (files.length === 0) {
    console.log("project update: no archive-checkin.json files found");
    return;
  }

  for (const filePath of files) {
    validateCheckinImport(filePath);
  }
}

function importProjectList(key = "import-project-list") {
  const files = projectCheckinFiles(key);

  if (files.length === 0) {
    console.log("project update: no archive-checkin.json files found");
    return;
  }

  for (const filePath of files) {
    const values = argsFromCheckin({ ...args, "from-json": filePath });
    delete values["validate-project-list"];
    delete values["import-project-list"];
    writeProjectUpdate(values);
  }
}

function syncProjectList() {
  checkProjectList("sync-project-list");
  importProjectList("sync-project-list");
}

function installCheckinProject(projectRoot, canSeedCheckin) {

  const notePath = path.join(projectRoot, "AGENTS.project-checkin.md");

  if (existsSync(notePath) && statSync(notePath).isDirectory()) {
    fail(`${path.relative(root, notePath)} is a directory`);
  }

  const template = readFileSync(path.join(root, "templates", "project-checkin", "AGENTS.project-checkin.md"), "utf8");
  const gitignorePath = path.join(projectRoot, ".gitignore");
  const agentsPath = path.join(projectRoot, "AGENTS.md");
  const checkinPath = path.join(projectRoot, "archive-checkin.json");

  if (existsSync(gitignorePath) && statSync(gitignorePath).isDirectory()) {
    fail(`${path.relative(root, gitignorePath)} is a directory`);
  }

  if (existsSync(agentsPath) && statSync(agentsPath).isDirectory()) {
    fail(`${path.relative(root, agentsPath)} is a directory`);
  }

  if (existsSync(checkinPath) && statSync(checkinPath).isDirectory()) {
    fail(`${path.relative(root, checkinPath)} is a directory`);
  }

  const gitignore = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
  const agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "";

  if (!existsSync(notePath)) {
    writeFileSync(notePath, template, "utf8");
    console.log(`project update: installed ${path.relative(root, notePath)}`);
  } else {
    console.log(`project update: kept existing ${path.relative(root, notePath)}`);
  }

  writeFileSync(gitignorePath, ensureIgnored(gitignore, "archive-checkin.json"), "utf8");
  writeFileSync(agentsPath, ensureCheckinPointer(agents), "utf8");
  console.log(`project update: ensured ${path.relative(root, gitignorePath)} ignores archive-checkin.json`);
  console.log(`project update: ensured ${path.relative(root, agentsPath)} points to AGENTS.project-checkin.md`);

  if (canSeedCheckin && typeof args.slug === "string" && args.slug.trim()) {
    seedCheckinFile(checkinPath);
  }
}

function checkInstall() {
  const projectRoot = projectDirectoryArg("check-install");
  const missing = checkInstallMissing(projectRoot);

  if (missing.length > 0) {
    fail(`${path.relative(root, projectRoot)} is missing ${missing.join(", ")}`);
  }

  console.log(`project update: ${path.relative(root, projectRoot)} is wired for archive check-ins`);
}

function checkProjectList(key = "check-project-list") {
  let failures = 0;

  for (const projectRoot of projectList(key)) {
    const missing = checkInstallMissing(projectRoot);

    if (missing.length > 0) {
      failures += 1;
      console.error(`project update: ${path.relative(root, projectRoot)} is missing ${missing.join(", ")}`);
    } else {
      console.log(`project update: ${path.relative(root, projectRoot)} is wired for archive check-ins`);
    }
  }

  if (failures > 0) {
    fail(`${failures} project install check(s) failed`);
  }
}

function checkInstallMissing(projectRoot) {
  const notePath = path.join(projectRoot, "AGENTS.project-checkin.md");
  const agentsPath = path.join(projectRoot, "AGENTS.md");
  const gitignorePath = path.join(projectRoot, ".gitignore");
  const missing = [];

  if (!existsSync(notePath) || statSync(notePath).isDirectory()) {
    missing.push("AGENTS.project-checkin.md");
  }

  if (!existsSync(agentsPath) || statSync(agentsPath).isDirectory() || !readFileSync(agentsPath, "utf8").includes("AGENTS.project-checkin.md")) {
    missing.push("AGENTS.md pointer");
  }

  if (!existsSync(gitignorePath) || statSync(gitignorePath).isDirectory() || !ignoredByText(readFileSync(gitignorePath, "utf8"), "archive-checkin.json")) {
    missing.push(".gitignore archive-checkin.json");
  }

  return missing;
}

function projectDirectoryArg(key) {
  const target = args[key];

  if (typeof target !== "string" || !target.trim()) {
    fail(`--${key} needs a project directory`);
  }

  const projectRoot = path.resolve(root, target);

  if (!existsSync(projectRoot) || !statSync(projectRoot).isDirectory()) {
    fail(`${target} is not a directory`);
  }

  return projectRoot;
}

function projectListPath(key) {
  const target = args[key] === true ? "archive-projects.txt" : args[key];

  if (typeof target !== "string" || !target.trim()) {
    fail(`--${key} needs a project list path`);
  }

  return path.resolve(root, target);
}

function projectList(key) {
  const filePath = projectListPath(key);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    fail(`${path.relative(root, filePath)} is not a project list file`);
  }

  const entries = projectListEntries(readFileSync(filePath, "utf8"));

  if (entries.length === 0) {
    fail(`${path.relative(root, filePath)} has no project directories`);
  }

  return entries.map(({ line, number }) => {
    const projectRoot = path.resolve(path.dirname(filePath), line);

    if (!existsSync(projectRoot) || !statSync(projectRoot).isDirectory()) {
      fail(`${path.relative(root, filePath)}:${number} ${line} is not a directory`);
    }

    return projectRoot;
  });
}

function projectCheckinFiles(key) {
  return projectList(key)
    .map((projectRoot) => path.join(projectRoot, "archive-checkin.json"))
    .filter((filePath) => {
      if (!existsSync(filePath)) {
        return false;
      }

      if (statSync(filePath).isDirectory()) {
        fail(`${path.relative(root, filePath)} is a directory`);
      }

      return true;
    });
}

function projectListEntries(source) {
  return source
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => line && !line.startsWith("#"));
}

function seedCheckinFile(filePath) {
  if (existsSync(filePath)) {
    console.log(`project update: kept existing ${path.relative(root, filePath)}`);
    return;
  }

  const template = checkinTemplate(args);

  assertSlugIfPresent(template.slug, "slug");
  assertVisibility(template.visibility);
  assertSafeText(JSON.stringify(template));
  writeFileSync(filePath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  console.log(`project update: seeded ${path.relative(root, filePath)}`);
}

function ensureIgnored(source, value) {
  if (ignoredByText(source, value)) {
    return source;
  }

  const separator = source && !source.endsWith("\n") ? "\n" : "";
  return `${source}${separator}${value}\n`;
}

function ignoredByText(source, value) {
  return source.split(/\r?\n/).map((line) => line.trim()).includes(value);
}

function ensureCheckinPointer(source) {
  if (source.includes("AGENTS.project-checkin.md")) {
    return source;
  }

  const prefix = source ? `${source}${source.endsWith("\n") ? "" : "\n"}\n` : "# AGENTS.md\n\n";
  return `${prefix}## Archive Check-In\n\nFor thebolanarchives project updates, read \`AGENTS.project-checkin.md\`.\n`;
}

function checkinTemplate(values) {
  return {
    slug: typeof values.slug === "string" ? values.slug.trim() : "",
    title: typeof values.title === "string" ? values.title.trim() : "",
    summary: typeof values.summary === "string" ? values.summary.trim() : "",
    visibility: typeof values.visibility === "string" ? values.visibility.trim() : "draft",
    tags: csv(values.tags),
    tools: csv(values.tools),
    current_state: "",
    changed: "",
    uncertain: "",
    public_evidence: "",
    next_move: "",
  };
}

function writeProjectLedger() {
  const ledgerPath = path.join(root, "public", "project-ledger.json");

  mkdirSync(path.dirname(ledgerPath), { recursive: true });
  writeFileSync(ledgerPath, `${JSON.stringify(readProjectLedger(), null, 2)}\n`, "utf8");
  console.log(`project update: wrote ${path.relative(root, ledgerPath)}`);
}

function printProjectLedger() {
  const ledger = args.all ? readProjectFiles() : readProjectLedger();

  if (args.json) {
    console.log(JSON.stringify(ledger, null, 2));
    return;
  }

  if (ledger.length === 0) {
    console.log("project ledger: no public build logs");
    return;
  }

  for (const project of ledger) {
    const visibility = args.all ? ` | ${project.visibility}` : "";
    console.log(`${project.slug}${visibility} | ${project.status} | updated ${project.updated}`);
    console.log(`  ${project.current_state}`);
    if (project.next_move) console.log(`  next: ${project.next_move}`);
  }
}

function readProjectLedger() {
  return readProjectFiles()
    .filter((project) => project.visibility === "public")
    .map(({ visibility: _visibility, ...project }) => project);
}

function readProjectFiles() {
  if (!existsSync(buildLogsRoot)) {
    return [];
  }

  return readdirSync(buildLogsRoot)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readProjectFile(path.join(buildLogsRoot, file)))
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
}

function readProjectFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  return projectFromSource(source, filePath);
}

function projectFromSource(source, filePath) {
  const { body, data } = parseFrontmatter(source, filePath);
  const slug = stringValue(data.slug) || path.basename(filePath, ".mdx");
  const update = latestUpdate(body);

  return {
    title: stringValue(data.title),
    slug,
    status: stringValue(data.status),
    confidence: stringValue(data.confidence),
    summary: stringValue(data.summary),
    updated: stringValue(data.updated),
    tags: arrayValue(data.tags),
    tools: arrayValue(data.tools),
    route: `/build-logs/${slug}`,
    current_state: firstPlainParagraph(sectionBlock(body, "current state")) || stringValue(data.summary),
    latest_update: update.text,
    next_move: update.nextMove || nextMoveFromBlock(body),
    visibility: stringValue(data.visibility),
  };
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    fail(`${filePath}: missing frontmatter`);
  }

  const data = {};
  let currentKey;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      const value = data[currentKey];
      data[currentKey] = Array.isArray(value) ? [...value, cleanScalar(listItem[1])] : [cleanScalar(listItem[1])];
      continue;
    }

    const field = line.match(/^([A-Za-z_][\w-]*):(?:\s*(.*))?$/);
    if (!field) {
      fail(`${filePath}: unsupported frontmatter line "${line}"`);
    }

    currentKey = field[1];
    data[currentKey] = cleanValue(field[2] ?? "");
  }

  return { data, body: source.slice(match[0].length).trim() };
}

function cleanValue(value) {
  if (value === "" || value === "[]") {
    return [];
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
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function latestUpdate(body) {
  const updates = Array.from(body.matchAll(/(?:^|\r?\n)## update \/\/ (\d{4}-\d{2}-\d{2})\s*\r?\n([\s\S]*?)(?=\r?\n##\s|$)/gi));
  const latest = updates.at(-1);

  if (!latest) {
    return { text: "", nextMove: "" };
  }

  return {
    text: firstPlainParagraph(latest[2]),
    nextMove: nextMoveFromBlock(latest[2]),
  };
}

function sectionBlock(body, heading) {
  const pattern = new RegExp(`(?:^|\\r?\\n)##\\s+${escapeRegExp(heading)}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n##\\s|$)`, "i");
  return body.match(pattern)?.[1] ?? "";
}

function firstPlainParagraph(block) {
  for (const paragraph of block.split(/\r?\n\s*\r?\n/)) {
    const text = plainText(paragraph);

    if (text) {
      return text.slice(0, 320);
    }
  }

  return "";
}

function nextMoveFromBlock(block) {
  return block.match(/\*\*next move:\*\*\s*(.+)/i)?.[1]?.trim() ?? "";
}

function plainText(block) {
  return block
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.startsWith("{`") && !trimmed.startsWith("`}");
    })
    .join(" ")
    .replace(/\*\*next move:\*\*.*$/i, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(values) {
  const result = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (!value.startsWith("--")) {
      fail(`unexpected argument "${value}"`);
    }

    const key = value.slice(2);
    const next = values[index + 1];

    if (next === undefined || next.startsWith("--")) {
      result[key] = true;
    } else {
      result[key] = next;
      index += 1;
    }
  }

  return result;
}

function requiredArg(values, key) {
  const value = values[key];

  if (typeof value !== "string" || !value.trim()) {
    fail(`missing --${key}`);
  }

  return value.trim();
}

function csv(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatArray(values) {
  return values.length === 0 ? " []" : `\n${values.map((value) => `  - ${escapeYaml(value)}`).join("\n")}`;
}

function escapeYaml(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function assertSlug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    fail("--slug must be lowercase kebab-case");
  }
}

function assertSlugIfPresent(value, label) {
  if (value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    fail(`--${label} must be lowercase kebab-case`);
  }
}

function assertDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`--${label} must use YYYY-MM-DD`);
  }
}

function assertVisibility(value) {
  if (!["draft", "unlisted", "public"].includes(value)) {
    fail("--visibility must be draft, unlisted, or public");
  }
}

function assertSafeText(text) {
  const unsafeReason = unsafeTextReason(text);

  if (unsafeReason) {
    fail(`refusing update text with ${unsafeReason}`);
  }
}

function unsafeTextReason(text) {
  const checks = [
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "email address"],
    [/\b(localhost|127\.0\.0\.1|10\.\d{1,3}\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i, "private host"],
    [/\b(password|passwd|api[_-]?key|secret|token|bearer)\b/i, "credential term"],
    [/\b(TODO|TBD|CHANGEME|REPLACE_ME|FIXME|lorem|ipsum|dummy|placeholder|replace this)\b/i, "filler or placeholder"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
    [/\b(AKIA|ASIA)[A-Z0-9]{16}\b/, "AWS access key"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/, "API key"],
  ];

  for (const [pattern, label] of checks) {
    if (pattern.test(text)) {
      return label;
    }
  }

  return "";
}

function fail(message) {
  console.error(`project update: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  assert.deepEqual(parseArgs(["--slug", "agent-loop", "--stdin", "--tags", "agents,archive"]), {
    slug: "agent-loop",
    stdin: true,
    tags: "agents,archive",
  });
  assert.equal(formatArray(["agents", "archive"]), "\n  - agents\n  - archive");
  assert.equal(
    normalizeCheckin(
      {
        slug: "agent-loop",
        title: "agent loop",
        summary: "A plain summary for a new build log imported from a project check-in.",
        current_state: "The other project can hand the archive a small JSON check-in.",
        changed: "The archive importer turns that check-in into a build-log update.",
        tags: ["agents", "archive"],
        tools: ["codex"],
        next_move: "copy the JSON shape into active projects.",
      },
      "self-check.json",
    ).note.includes("**what changed:**"),
    true,
  );
  const defaultBuildLog = newBuildLog({
    args: normalizeCheckin(
      {
        slug: "agent-loop",
        title: "agent loop",
        summary: "A plain summary for a new build log imported from a project check-in.",
        current_state: "The other project can omit optional fields and keep safe defaults.",
      },
      "self-check.json",
    ),
    note: "The other project can omit optional fields and keep safe defaults.",
    slug: "agent-loop",
    today: "2026-06-16",
  });
  assert.equal(defaultBuildLog.includes('status: "working_note"'), true);
  assert.equal(defaultBuildLog.includes('confidence: "partial"'), true);
  assert.equal(defaultBuildLog.includes('visibility: "draft"'), true);
  validateUpdate(
    {
      slug: "agent-loop-validation",
      title: "agent loop validation",
      summary: "A plain summary for checking a project update before it writes archive content.",
      tags: "agents,archive",
      note: "The dry run can validate a sanitized check-in before writing MDX.",
    },
    {
      filePath: path.join(root, ".project-update-self-check.mdx"),
      note: "The dry run can validate a sanitized check-in before writing MDX.",
      slug: "agent-loop-validation",
      today: "2026-06-16",
    },
  );
  assert.deepEqual(checkinTemplate({ slug: "agent-loop", tags: "agents,archive", tools: "codex" }), {
    slug: "agent-loop",
    title: "",
    summary: "",
    visibility: "draft",
    tags: ["agents", "archive"],
    tools: ["codex"],
    current_state: "",
    changed: "",
    uncertain: "",
    public_evidence: "",
    next_move: "",
  });
  assert.equal(ensureIgnored("node_modules/\n", "archive-checkin.json"), "node_modules/\narchive-checkin.json\n");
  assert.equal(ensureIgnored("archive-checkin.json\n", "archive-checkin.json"), "archive-checkin.json\n");
  assert.equal(ignoredByText("node_modules/\narchive-checkin.json\n", "archive-checkin.json"), true);
  assert.deepEqual(projectListEntries("# local only\n../one\n\n ./two \n"), [
    { line: "../one", number: 2 },
    { line: "./two", number: 4 },
  ]);
  assert.equal(alreadyImported("<!-- project-update:import:abc123 -->\n", { _importId: "abc123" }), true);
  assert.equal(alreadyImported("", { _importId: "abc123" }), false);
  const savedArgs = args;
  const tempRoot = mkdtempSync(path.join(tmpdir(), "tba-project-update-"));
  try {
    const projectRoot = path.join(tempRoot, "project");
    const emptyRoot = path.join(tempRoot, "empty");
    mkdirSync(projectRoot);
    mkdirSync(emptyRoot);
    writeFileSync(path.join(projectRoot, "archive-checkin.json"), "{}\n", "utf8");
    writeFileSync(path.join(tempRoot, "archive-projects.txt"), "./project\n./empty\n", "utf8");
    args = { "self-check-project-list": path.join(tempRoot, "archive-projects.txt") };
    assert.deepEqual(projectCheckinFiles("self-check-project-list"), [path.join(projectRoot, "archive-checkin.json")]);
  } finally {
    args = savedArgs;
    rmSync(tempRoot, { recursive: true, force: true });
  }
  assert.equal(ensureCheckinPointer("").includes("AGENTS.project-checkin.md"), true);
  assert.equal(ensureCheckinPointer("Read AGENTS.project-checkin.md\n"), "Read AGENTS.project-checkin.md\n");
  assert.equal(setUpdated('---\nupdated: "2026-06-15"\n---\nbody\n', "2026-06-16").includes('updated: "2026-06-16"'), true);
  assert.equal(unsafeTextReason("TODO: fill this later"), "filler or placeholder");
  assert.equal(
    projectFromSource(
      `---
title: "agent loop"
slug: "agent-loop"
status: "working_note"
confidence: "partial"
summary: "A plain summary of the project state."
updated: "2026-06-16"
tags:
  - agents
tools: []
visibility: "public"
---

# build_log // agent_loop

## current state

The loop writes updates into public-safe build logs.

## update // 2026-06-16

The ledger now reads project state from the same MDX source.

**next move:** use it after each owner check-in.
`,
      "self-check.mdx",
    ).next_move,
    "use it after each owner check-in.",
  );
  console.log("project update self-check: ok");
}
