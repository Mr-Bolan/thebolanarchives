# backlog (generated)

Generated mirror of `garden/state/backlog.json`. Do not edit by hand — run
`npm run garden:backlog` to regenerate. Edit the JSON instead.

Last generated: 2026-06-23

## ready

_(none)_

## needs-source

_(none)_

## in-progress

_(none)_

## blocked

_(none)_

## deferred

- **de-duplicate frontmatter validation (content.ts vs content-audit.mjs)** (`seed-dedupe-frontmatter-validation`, refactor, low)
  Two parallel implementations risk drifting: (1) frontmatter validation in src/lib/content.ts (readContentFile) vs scripts/content-audit.mjs; (2) the archive-graph builder in src/lib/graph.ts (buildArchiveGraph) vs garden/scripts/lib/garden-core.mjs (buildArchiveGraphFromRecords). Extract shared validators/builders so TS and node scripts cannot disagree. Risky because the first gates publishing; do it carefully behind agent:check.

- **expand the Blackbox Garden graph (reverse-index + series edges)** (`seed-graph-expansion`, graph, low)
  After the base graph ships, add a reverse-index (records linking here), series/sequence edges, and tag-weighted layout so the map gets richer as the archive grows.

- **draft a de-identified article from a registered source** (`source-c28e0f8f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-e630bf49`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

## done

- **backfill points frontmatter on existing records** (`seed-backfill-points`, content, medium)
  Add an optional points list (key claims relevant to each page) to the 7 existing public records so the key-points block renders and the schema-softening is real, not just supported.

- **write first de-identified articles from a registered source** (`seed-first-articles`, content, high)
  Once the owner registers a local repo path or GitHub repo in archive-projects.txt, scan it and write the first de-identified build-log / entry about what it set out to do, how it evolved, how long it has been worked on, what works, what does not, and any novel idea worth a diagram.

- **make the garden graph inspectable** (`intake-feature-grab-and-manipulate-graph-garden`, feature, medium)
  Add pan, zoom, node dragging, keyboard nudging, and tag activation to the /garden graph so dense clusters can be inspected without changing routes or adding dependencies.

## published

- **draft a de-identified article from a registered source** (`source-59727238`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-c87328e0`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-8a0a8869`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-1eb2af4f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-3d6ae11d`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-dc0a8650`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-c627be20`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b60f8b29`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-0df1f5c8`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-013a284a`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-369cc430`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b3fcc99a`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-79fffc37`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-29b15786`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-4097c6aa`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-ef249c61`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-fe4ef9b2`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-ba33ecf7`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-931607f2`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b91ac862`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.
