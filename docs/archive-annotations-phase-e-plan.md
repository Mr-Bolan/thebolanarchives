# Archive Annotations Phase E plan

Status: planning only. Do not build this until Phase E is explicitly approved.

## goal

Add durable historical annotation intake through GitHub Discussions while preserving the
static archive site. The site should publish only reviewed annotations from static JSON.

## chosen backend shape

- Storage/intake: GitHub Discussions category, preferably `archive-annotations`.
- Render source: `content/annotations/<record-slug>.json`.
- Publication: manual curation first, optional build-time export later.
- Runtime behavior: no live fetch, no API routes, no server actions, no database.

## implementation steps

1. Configure a GitHub Discussions category for archive annotations.
2. Add a GitHub Discussion category form with required fields for record slug, anchor ID,
   note body, and public-submission consent.
3. Replace or supplement the Phase C mock submit action with an external GitHub handoff.
4. Keep the current mock composer available only as a local/session prototype until the
   handoff is ready.
5. Document how maintainers move accepted notes into `content/annotations/*.json`.
6. Run `npm run annotations:audit`, `npm run agent:check`, and `npm run deploy:check`
   before publishing any site-visible note.

## optional later automation

Only after manual intake proves useful:

- Add a GitHub Actions job that exports accepted discussions into a review branch.
- Use only the built-in `GITHUB_TOKEN` or a narrowly scoped repository secret in Actions.
- Open a pull request with generated JSON changes.
- Keep humans in the approval loop.

Do not expose GitHub tokens in client JavaScript. Do not write directly to `main` from a
reader submission.

## acceptance criteria

- A reader can leave a durable note through GitHub.
- The submission page tells readers their GitHub identity is public.
- The website remains a static export.
- No new dependency, database, CMS, or API route is required for the first pass.
- Notes do not appear on the site until reviewed and committed as static JSON.
- Disabling intake does not break existing published annotations.

## rollback

Remove the site link to the discussion form or disable the GitHub category. Static
annotations already committed to JSON continue to render.
