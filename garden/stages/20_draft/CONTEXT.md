# stage 20 — draft

One job: take a single `ready` backlog item and produce the change it describes —
de-identified MDX, an updated record, feature code, or an annotation edit. This stage does
not publish and does not pass its own work; stage 30 moderates it.

## Inputs

- Layer 4 (working): the chosen backlog item from `garden/state/backlog.json` (and its
  `garden/state/private/<id>.md` if it references one).
- Layer 3 (reference): `docs/content-model.md` — frontmatter schema, points + tags,
  optional sections.
- Layer 3 (reference): `docs/archive-style-guide.md` — voice, lowercase, honest
  uncertainty, no gloss.
- Layer 3 (reference): `docs/privacy-and-public-repo.md` — de-identification rules.
- Layer 3 (reference): for `site-feature` items, the matching feature docs and
  `docs/component-map.md`; for project links, `docs/project-linking.md`.
- Layer 4 (working): the relevant template in `templates/content/*.mdx` for new records.

## Process

1. Pick exactly one item. Set its `status` to `in-progress` in the backlog.
2. De-identify first. Translate source material into the archive's anonymous voice: strip
   names, clients, private paths/URLs; keep the system, the decision, the failure, the
   lesson. The work is the identity.
3. Write the change in the smallest scope that fully satisfies the item:
   - article / update: create or edit MDX under `content/<type>/`. Use frontmatter
     `points` for the page's key claims and `tags` relevant to the page. Sections are
     guidance, not a fixed schema — shape the record to its content.
   - feature / code: edit focused `src/**` or `garden/scripts/**` per the matching mode in
     `docs/agent-workflow.md`.
   - annotation edit: defer to stage 50.
4. Honesty over polish: set `status`/`confidence` to what is true; mark uncertainty with
   `last_verified` / `source_context`. Never upgrade maturity for shine.
5. Record what you built (and what is still open) in the backlog item so moderation has
   context.

## Outputs

- New or edited files in `content/**` and/or `src/**` and/or `garden/**`.
- Updated backlog item (`in-progress`, with notes for the moderator).

## Verify

- `npm run content:audit` passes for content changes.
- The change matches one task mode in `docs/agent-workflow.md`; nothing out of mode.
- No private detail introduced. No new heavy dependency without an explicit item.
- Hand off to stage 30; do not self-approve.
