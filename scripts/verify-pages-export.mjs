#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
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

addCheck("out/ exists", dirExists("."), outDir);
addCheck("out/index.html exists", fileExists("index.html"), "GitHub Pages entry file");
addCheck("out/archive-index.json exists", fileExists("archive-index.json"), "public archive data");

const needsNextDir = htmlReferencesNextAssets();
addCheck(
  "out/_next/ exists if generated",
  needsNextDir ? dirExists("_next") : true,
  needsNextDir ? "exported HTML references /_next/" : "not referenced by exported HTML",
);

for (const route of ["/about", "/index", ...collectionRoutes]) {
  const routeFile = findRouteFile(route);
  addCheck(`route ${route}`, Boolean(routeFile), routeFile ?? `expected ${routeCandidates(route).join(" or ")}`);
}

for (const route of readArchiveRoutes()) {
  const routeFile = findRouteFile(route);
  addCheck(`record route ${route}`, Boolean(routeFile), routeFile ?? `expected ${routeCandidates(route).join(" or ")}`);
}

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
