# stage 00 — intake

One job: turn raw signals into sanitized, structured backlog items. This stage never
writes site content and never publishes.

## Inputs

- Layer 4 (working): `garden/intake/article-updates/*.md` — owner notes about an article or
  page to change.
- Layer 4 (working): `garden/intake/feature-requests/*.md` — owner notes about code or
  features to add to the garden.
- Layer 4 (working): `archive-projects.txt` (repo root, gitignored) — registered local repo
  paths and GitHub repos to scan for new build-log / article material.
- Layer 4 (working): reader annotations pending in GitHub Discussions (via
  `scripts/archive-discussions.mjs`).
- Layer 3 (reference): `docs/privacy-and-public-repo.md` — what must never enter committed
  state.
- Layer 4 (state): `garden/state/backlog.json` — existing items, to dedupe against.

## Process

1. For each intake note: parse intent, sanitize (strip private names, URLs, paths,
   credentials, client detail), and create one or more backlog items. Any sensitive
   specifics needed for the work go to `garden/state/private/<id>.md` (gitignored); the
   backlog item references them by id only.
2. For each registered source: detect new or changed work worth writing about. Create a
   `needs-source` or `ready` article/build-log item. Do not copy raw repo content into the
   backlog; summarize sanitized intent.
3. For reader annotations: create one `annotation` item per record with pending screened
   notes (the actual screening happens in stage 50).
4. Dedupe against existing backlog items. Merge rather than duplicate.
5. Archive consumed raw intake notes (move out of the inbox; raw note bodies stay
   gitignored). Never delete owner intent without recording it as a backlog item first.

This stage is mechanical — run it with `npm run garden:intake`. Use a sub-agent only when a
note needs interpretation beyond the script.

## Outputs

- Updated `garden/state/backlog.json` (new/merged items, sanitized).
- `garden/state/private/<id>.md` for any sensitive specifics (gitignored).
- Regenerated `garden/state/backlog.md`.

## Verify

- No private detail in `backlog.json` or `backlog.md` (run `npm run privacy:audit` scope is
  content/public; manually confirm state files are clean).
- Every new item has: `id`, `type`, `title`, `status`, `source`, and a sanitized
  `summary`.
- Consumed notes are archived, not silently dropped.
