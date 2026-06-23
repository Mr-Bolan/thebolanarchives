#!/usr/bin/env node
// Regenerate the workspace catalog: garden/state/catalog.json (machine) + docs/workspace-catalog.md
// (human). Enumerates routes, components, lib exports, scripts, npm scripts, templates,
// prompts, skills, workflows, and docs so any agent can route without re-scanning.
// Usage: node garden/scripts/catalog.mjs [--self-check] [--check]
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gardenStateDir, root, walkFiles } from "./lib/garden-core.mjs";

if (process.argv.includes("--self-check")) {
  runSelfCheck();
  process.exit(0);
}

const checkOnly = process.argv.includes("--check");
const catalog = buildCatalog();

const catalogJsonPath = path.join(gardenStateDir, "catalog.json");
const catalogMdPath = path.join(root, "docs", "workspace-catalog.md");
const markdown = renderCatalogMarkdown(catalog);

if (checkOnly) {
  const jsonCurrent = existsSync(catalogJsonPath) ? readFileSync(catalogJsonPath, "utf8") : "";
  const mdCurrent = existsSync(catalogMdPath) ? readFileSync(catalogMdPath, "utf8") : "";
  const jsonNext = `${JSON.stringify(catalog, null, 2)}\n`;
  // Ignore the volatile `generated` timestamp / date so --check tracks real content drift.
  const stale =
    normalizeJson(jsonCurrent) !== normalizeJson(jsonNext) ||
    normalizeMarkdown(mdCurrent) !== normalizeMarkdown(markdown);
  if (stale) {
    fail("catalog is stale; run `npm run garden:catalog`");
  }
  console.log("garden catalog: up to date");
  process.exit(0);
}

writeFileSync(catalogJsonPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
writeFileSync(catalogMdPath, markdown, "utf8");
console.log(
  `garden catalog: ${catalog.totals.routes} routes, ${catalog.totals.components} components, ${catalog.totals.scripts} scripts; wrote catalog.json + docs/workspace-catalog.md`,
);

function buildCatalog() {
  const routes = collectRoutes();
  const components = collectComponents();
  const lib = collectLib();
  const scripts = collectScripts();
  const npmScripts = collectNpmScripts();
  const templates = walkFiles("templates", (f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const skills = collectSkills();
  const workflows = walkFiles(".github/workflows", (f) => f.endsWith(".yml") || f.endsWith(".yaml"));
  const docs = walkFiles("docs", (f) => f.endsWith(".md")).sort();

  return {
    generated: new Date().toISOString(),
    routes,
    components,
    lib,
    scripts,
    npmScripts,
    templates,
    skills,
    workflows,
    docs,
    totals: {
      routes: routes.length,
      components: components.length,
      libModules: lib.length,
      scripts: scripts.length,
      docs: docs.length,
    },
  };
}

function collectRoutes() {
  return walkFiles("src/app", (f) => /[/\\]page\.tsx$/.test(f))
    .map((file) => {
      const rel = file.replace(/^src\/app/, "").replace(/\/page\.tsx$/, "");
      const route = rel === "" ? "/" : rel;
      return { route: route.replace(/\[(\w+)\]/g, ":$1"), file };
    })
    .sort((a, b) => a.route.localeCompare(b.route));
}

function collectComponents() {
  return walkFiles("src/components", (f) => f.endsWith(".tsx"))
    .map((file) => ({
      name: path.basename(file, ".tsx"),
      folder: path.dirname(file).replace(/^src\/components\/?/, "") || "(root)",
      file,
    }))
    .sort((a, b) => a.file.localeCompare(b.file));
}

function collectLib() {
  return walkFiles("src/lib", (f) => f.endsWith(".ts"))
    .map((file) => ({ file, exports: extractExports(path.join(root, file)) }))
    .sort((a, b) => a.file.localeCompare(b.file));
}

function extractExports(absFile) {
  const source = readFileSync(absFile, "utf8");
  const names = new Set();
  const re = /export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    names.add(match[1]);
  }
  return [...names];
}

function collectScripts() {
  return [
    ...walkFiles("scripts", (f) => f.endsWith(".mjs")),
    ...walkFiles("garden/scripts", (f) => f.endsWith(".mjs")),
  ].sort();
}

function collectNpmScripts() {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  return Object.entries(pkg.scripts ?? {}).map(([name, command]) => ({ name, command }));
}

function collectSkills() {
  const skills = walkFiles("garden/skills", (f) => f.endsWith("SKILL.md")).map((file) => ({
    name: path.basename(path.dirname(file)),
    file,
    committed: true,
  }));
  // .agents/skills is gitignored (local-only); note it without committing its contents.
  if (existsSync(path.join(root, ".agents", "skills"))) {
    skills.push({ name: "(local .agents/skills present, gitignored)", file: ".agents/skills", committed: false });
  }
  return skills;
}

function renderCatalogMarkdown(catalog) {
  const lines = [
    "# workspace catalog (generated)",
    "",
    "Generated inventory of the workspace so any agent can route without re-scanning. Do not",
    "edit by hand — run `npm run garden:catalog` to regenerate. The orchestrator keeps this",
    "current; `npm run garden:catalog -- --check` fails if it has drifted.",
    "",
    `Last generated: ${catalog.generated.slice(0, 10)}`,
    "",
    "## routes",
    "",
    "| route | file |",
    "| --- | --- |",
    ...catalog.routes.map((r) => `| \`${r.route}\` | ${r.file} |`),
    "",
    "## components",
    "",
    "| component | folder | file |",
    "| --- | --- | --- |",
    ...catalog.components.map((c) => `| ${c.name} | ${c.folder} | ${c.file} |`),
    "",
    "## lib modules",
    "",
    "| module | exports |",
    "| --- | --- |",
    ...catalog.lib.map((m) => `| ${m.file} | ${m.exports.join(", ") || "-"} |`),
    "",
    "## scripts",
    "",
    ...catalog.scripts.map((s) => `- ${s}`),
    "",
    "## npm scripts",
    "",
    "| script | command |",
    "| --- | --- |",
    ...catalog.npmScripts.map((s) => `| \`${s.name}\` | \`${s.command}\` |`),
    "",
    "## templates and prompts",
    "",
    ...catalog.templates.map((t) => `- ${t}`),
    "",
    "## skills",
    "",
    ...catalog.skills.map((s) => `- ${s.name} (${s.committed ? "committed" : "local-only"}) — ${s.file}`),
    "",
    "## workflows",
    "",
    ...catalog.workflows.map((w) => `- ${w}`),
    "",
    "## docs",
    "",
    ...catalog.docs.map((d) => `- ${d}`),
    "",
  ];
  return `${lines.join("\n").trimEnd()}\n`;
}

function normalizeJson(text) {
  if (!text) return "";
  try {
    const data = JSON.parse(text);
    delete data.generated;
    return JSON.stringify(data);
  } catch {
    return text;
  }
}

function normalizeMarkdown(text) {
  return text.replace(/^Last generated:.*$/m, "Last generated:");
}

function fail(message) {
  console.error(`garden catalog: ${message}`);
  process.exit(1);
}

function runSelfCheck() {
  assert.deepEqual(
    collectRoutesFrom(["src/app/page.tsx", "src/app/entries/page.tsx", "src/app/entries/[slug]/page.tsx"]),
    [
      { route: "/", file: "src/app/page.tsx" },
      { route: "/entries", file: "src/app/entries/page.tsx" },
      { route: "/entries/:slug", file: "src/app/entries/[slug]/page.tsx" },
    ],
  );
  const md = renderCatalogMarkdown({
    generated: "2026-06-22T00:00:00.000Z",
    routes: [{ route: "/", file: "src/app/page.tsx" }],
    components: [],
    lib: [],
    scripts: [],
    npmScripts: [],
    templates: [],
    skills: [],
    workflows: [],
    docs: [],
  });
  assert.match(md, /# workspace catalog \(generated\)/);
  assert.match(md, /\| `\/` \| src\/app\/page\.tsx \|/);
  console.log("garden catalog self-check: ok");
}

// pure variant of collectRoutes for self-check
function collectRoutesFrom(files) {
  return files
    .filter((f) => /[/\\]page\.tsx$/.test(f))
    .map((file) => {
      const rel = file.replace(/^src\/app/, "").replace(/\/page\.tsx$/, "");
      const route = rel === "" ? "/" : rel;
      return { route: route.replace(/\[(\w+)\]/g, ":$1"), file };
    })
    .sort((a, b) => a.route.localeCompare(b.route));
}
