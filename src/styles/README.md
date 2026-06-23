# src/styles/

Global styling and design tokens. Dark, quiet, archival.

- `tokens.css` — CSS custom properties: backgrounds, text, accents, borders, fonts, and
  spacing scale. Imported first by `global.css`.
- `global.css` — base resets, element defaults, and all component styling (archive cards,
  index, metadata, annotations, the garden graph, key-points block). A single stylesheet by
  design; there are no separate `typography.css` / `archive.css` files.

Do not look like a generic Tailwind SaaS page.
