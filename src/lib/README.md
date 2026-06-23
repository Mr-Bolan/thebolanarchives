# src/lib/

Content + data utilities (TypeScript). The authoritative inventory is generated in
`docs/workspace-catalog.md` (run `npm run garden:catalog`).

- `content.ts` — load and parse MDX from `content/`, read frontmatter, validate the schema,
  and build the archive list. Ignores `README.md` files in content folders. Exposes
  collection metadata, `getAllArchiveItems`, per-slug lookups, related resolution, and the
  static-params helpers (filtering/sorting for `/index` lives in the `ArchiveIndex`
  component, not a separate module).
- `graph.ts` — build the Blackbox Garden graph (records + tags as nodes; `related`,
  shared-tag, and series edges) for the `/garden` route.
- `annotations.ts` — load reader annotations from `content/annotations/*.json`.
- `annotation-discussions.ts` — map records to their GitHub Discussion threads.
- `headings.ts` — extract markdown headings for the table of contents.
- `page-metadata.ts` — shared page metadata helpers.
