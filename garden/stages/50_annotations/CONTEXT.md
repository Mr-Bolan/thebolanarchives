# stage 50 — annotations

One job: get approved reader notes from GitHub Discussions onto the live site. This is the
fix for "notes never showed up": approved notes are committed to `main` so the next deploy
renders them — no human PR merge in the path.

## Inputs

- Layer 4 (working): pending reader comments in GitHub Discussions (via
  `scripts/archive-discussions.mjs`).
- Layer 4 (state): `content/annotation-discussions.json` — the record -> discussion
  registry.
- Layer 3 (reference): `garden/skills/auto-moderation/SKILL.md` — annotation screening +
  approval rubric.
- Layer 3 (reference): `docs/archive-annotations-auto-moderation.md` — screening states and
  hard boundaries.
- Requires `GITHUB_TOKEN` or `GH_TOKEN` in the environment for the GitHub GraphQL calls.

## Process

1. Sync: `npm run discussions:sync` — ensure each public/unlisted record has a discussion;
   update the registry.
2. Export + screen: `npm run discussions:export` — fetch comments, run the rules-based
   screener, write `screen_clear` notes into `content/annotations/<slug>.json`.
3. Moderate the screened notes with the auto-moderation skill (annotation rubric). The
   skill is the approver now — `screen_clear` plus a `publish` verdict means the note is
   approved for the site. `screen_needs_review` / `screen_blocked` / `screen_invalid_target`
   stay off the site and become (or update) a backlog item if they need owner attention.
4. Run `npm run annotations:audit` to validate the JSON (schema, anchors, privacy).
5. Hand the committed annotation JSON to stage 40 to publish (commit straight to `main`,
   no `archive-intake-screen` PR branch).

## Outputs

- Updated `content/annotations/<slug>.json` (approved notes only).
- Updated `content/annotation-discussions.json` (registry).
- Backlog items for notes that need owner attention.

## Verify

- `npm run annotations:audit` passes.
- Only `screen_clear` + `publish` notes are in the committed JSON.
- Each exported note preserves its source GitHub comment URL.
- No client-side secrets; GitHub calls ran in the loop/runner, never in the browser.
