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

## done

- **backfill points frontmatter on existing records** (`seed-backfill-points`, content, medium)
  Add an optional points list (key claims relevant to each page) to the 7 existing public records so the key-points block renders and the schema-softening is real, not just supported.

- **write first de-identified articles from a registered source** (`seed-first-articles`, content, high)
  Once the owner registers a local repo path or GitHub repo in archive-projects.txt, scan it and write the first de-identified build-log / entry about what it set out to do, how it evolved, how long it has been worked on, what works, what does not, and any novel idea worth a diagram.
