# src/app/

Next.js App Router. Future routes and layouts live here. The site is statically exported
(`output: 'export'`) for GitHub Pages.

Planned routing (see `codex.md` for the full table):

| route | file (future) |
| --- | --- |
| `/` | `app/page.tsx` |
| `/entries` | `app/entries/page.tsx` (+ `[slug]/page.tsx`) |
| `/field-notes` | `app/field-notes/page.tsx` (+ `[slug]/page.tsx`) |
| `/build-logs` | `app/build-logs/page.tsx` (+ `[slug]/page.tsx`) |
| `/fragments` | `app/fragments/page.tsx` (+ `[slug]/page.tsx`) |
| `/patterns` | `app/patterns/page.tsx` (+ `[slug]/page.tsx`) |
| `/experiments` | `app/experiments/page.tsx` (+ `[slug]/page.tsx`) |
| `/graveyard` | `app/graveyard/page.tsx` (+ `[slug]/page.tsx`) |
| `/index` | `app/index/page.tsx` (filterable archive) |
| `/about` | `app/about/page.tsx` |

Pending: `layout.tsx`, `page.tsx`, route folders, MDX wiring.
