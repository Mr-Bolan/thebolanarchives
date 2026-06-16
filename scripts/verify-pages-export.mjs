#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const projectBasePath = "/thebolanarchives";
const collectionRoutes = [
  "/entries",
  "/field-notes",
  "/build-logs",
  "/fragments",
  "/patterns",
  "/experiments",
  "/graveyard",
];

const checks = [];

function addCheck(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

function stat(relativePath) {
  const fullPath = path.join(outDir, relativePath);
  return existsSync(fullPath) ? statSync(fullPath) : null;
}

function fileExists(relativePath) {
  return stat(relativePath)?.isFile() === true;
}

function dirExists(relativePath) {
  return stat(relativePath)?.isDirectory() === true;
}

function routeCandidates(route) {
  if (route === "/") return ["index.html"];
  if (route === "/index") return ["index/index.html"];

  const cleanRoute = route.replace(/^\//, "");
  return [`${cleanRoute}.html`, `${cleanRoute}/index.html`];
}

function findRouteFile(route) {
  return routeCandidates(route).find(fileExists);
}

function htmlFiles(dir = outDir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function htmlAttributeValues() {
  const attributePattern = /\b(href|src|action)=["']([^"']+)["']/g;

  return htmlFiles().flatMap((file) => {
    const html = readFileSync(file, "utf8");
    const relativeFile = path.relative(outDir, file);
    const values = [];
    let match;

    while ((match = attributePattern.exec(html))) {
      values.push({ attr: match[1], file: relativeFile, value: match[2] });
    }

    return values;
  });
}

function htmlReferencesNextAssets() {
  return htmlFiles().some((file) => readFileSync(file, "utf8").includes("/_next/"));
}

function readArchiveRoutes() {
  if (!fileExists("archive-index.json")) return [];

  try {
    const records = JSON.parse(readFileSync(path.join(outDir, "archive-index.json"), "utf8"));
    addCheck(
      "out/archive-index.json parses",
      Array.isArray(records),
      Array.isArray(records) ? `${records.length} records` : "expected a JSON array",
    );
    return Array.isArray(records)
      ? records.map((record) => record.route).filter((route) => typeof route === "string")
      : [];
  } catch (error) {
    addCheck("out/archive-index.json parses", false, error.message);
    return [];
  }
}

function readProjectLedgerRoutes() {
  if (!fileExists("project-ledger.json")) return [];

  try {
    const records = JSON.parse(readFileSync(path.join(outDir, "project-ledger.json"), "utf8"));
    addCheck(
      "out/project-ledger.json parses",
      Array.isArray(records),
      Array.isArray(records) ? `${records.length} projects` : "expected a JSON array",
    );
    return Array.isArray(records)
      ? records.map((record) => record.route).filter((route) => typeof route === "string")
      : [];
  } catch (error) {
    addCheck("out/project-ledger.json parses", false, error.message);
    return [];
  }
}

addCheck("out/ exists", dirExists("."), outDir);
addCheck("out/index.html exists", fileExists("index.html"), "GitHub Pages entry file");
addCheck("out/archive-index.json exists", fileExists("archive-index.json"), "public archive data");
addCheck("out/project-ledger.json exists", fileExists("project-ledger.json"), "public project state data");

const needsNextDir = htmlReferencesNextAssets();
addCheck(
  "out/_next/ exists if generated",
  needsNextDir ? dirExists("_next") : true,
  needsNextDir ? "exported HTML references Next assets" : "not referenced by exported HTML",
);

for (const route of ["/about", "/index", ...collectionRoutes]) {
  const routeFile = findRouteFile(route);
  addCheck(`route ${route}`, Boolean(routeFile), routeFile ?? `expected ${routeCandidates(route).join(" or ")}`);
}

const archiveRoutes = readArchiveRoutes();
const projectLedgerRoutes = readProjectLedgerRoutes();

for (const route of [...archiveRoutes, ...projectLedgerRoutes]) {
  const routeFile = findRouteFile(route);
  addCheck(`record route ${route}`, Boolean(routeFile), routeFile ?? `expected ${routeCandidates(route).join(" or ")}`);
}

const htmlAttrs = htmlAttributeValues();
const badRootAttrs = htmlAttrs.filter(({ value }) => {
  return value.startsWith("/") && !value.startsWith("//") && value !== projectBasePath && !value.startsWith(`${projectBasePath}/`);
});

addCheck(
  "HTML links/assets use project base path",
  badRootAttrs.length === 0,
  badRootAttrs.slice(0, 5).map(({ attr, file, value }) => `${file} ${attr}=${value}`).join("; "),
);

for (const route of ["/entries", "/about", "/graveyard/dashboard-without-decisions"]) {
  const expected = `${projectBasePath}${route}`;
  addCheck(
    `HTML references ${expected}`,
    htmlAttrs.some(({ value }) => value === expected || value.startsWith(`${expected}#`) || value.startsWith(`${expected}?`)),
    "expected project-prefixed internal link",
  );
}

const nextAssetAttrs = htmlAttrs.filter(({ value }) => value.includes("/_next/"));
addCheck(
  "Next assets use project base path",
  nextAssetAttrs.every(({ value }) => value.startsWith(`${projectBasePath}/_next/`)),
  nextAssetAttrs.filter(({ value }) => !value.startsWith(`${projectBasePath}/_next/`)).slice(0, 5).map(({ file, value }) => `${file} ${value}`).join("; "),
);

console.log("GitHub Pages export verification");

for (const check of checks) {
  console.log(`${check.ok ? "ok  " : "fail"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error(`\nfailed: ${failures.length} Pages artifact check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log(`\npassed: ${checks.length} Pages artifact checks. Publish out/ with GitHub Actions.`);
}
