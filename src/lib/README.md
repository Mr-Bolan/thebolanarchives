# src/lib/

Content + data utilities (TypeScript).

- `content.ts` — load and parse MDX from `content/`, read frontmatter, build the archive list.
  Must ignore `README.md` files in content folders.
- `filters.ts` — filter/sort by type, status, year, topic, confidence, tool, maturity (powers `/index`).
- `related.ts` — resolve `related` slugs into linked artefacts.

Pending: all utility code.
