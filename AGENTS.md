# AGENTS.md

Required entry point for any agent working on `thebolanarchives`. Assume this repository is public.

## Identity

`thebolanarchives` is an anonymous archive, digital garden, machine field manual, and static record of unfinished systems. Preserve the Blackbox Garden theme: dark technical archive, honest uncertainty, lowercase where natural, no portfolio gloss.

## Read First

1. `AGENTS.md`
2. `codex.md`
3. `docs/agent-workflow.md`
4. `docs/content-authoring.md`
5. `docs/content-model.md`
6. `docs/archive-style-guide.md`
7. `docs/project-linking.md`
8. `docs/privacy-and-public-repo.md`
9. `docs/design-plan.md`
10. `docs/component-map.md`
11. `docs/deploy.md`

## Task Modes

Use one mode from `docs/agent-workflow.md`: `content-capture`, `content-draft`, `content-update`, `content-publish`, `project-link`, `site-feature`, `visual-polish`, or `deploy-maintenance`.

For `site-feature` work involving Archive Annotations, read
`docs/archive-annotations-design-plan.md`,
`docs/archive-annotations-technical-plan.md`, and
`docs/archive-annotations-roadmap.md` before implementation.

| mode | allowed | forbidden unless explicitly requested |
| --- | --- | --- |
| `content-capture` | local `content/inbox/`, content notes | `src/`, routes, deploy, package files |
| `content-draft` | `content/**`, `templates/content/**` | routes, styles, deploy, package files |
| `content-update` | existing MDX records, content docs | route/design/deploy changes |
| `content-publish` | MDX visibility/status metadata, generated public index | body rewrites not requested |
| `project-link` | `external_links` frontmatter, project-link docs | new `/projects` route |
| `site-feature` | `src/**`, component docs, focused scripts | CMS, database, search, route churn |
| `visual-polish` | CSS/components/theme docs | content meaning, routes, deploy model |
| `deploy-maintenance` | `.github/**`, `next.config.mjs`, deploy docs/scripts | content rewrites, theme redesign |

Never commit `out/`, `.next/`, `node_modules/`, `.env*`, `privacy-blocklist.json`, private names, private emails, private URLs, credentials, or unpublished personal context.

Do not commit `content/inbox/` except `content/inbox/.gitkeep`. Do not commit `content/private/`, `docs/private/`, `notes/private/`, `scratch/`, `transcripts/`, local agent/tool state, or private blocklist values.

## Publishing Rules

- Follow `docs/content-authoring.md` and `docs/content-model.md`.
- Public and unlisted MDX must pass `npm run content:audit`.
- `draft` records must not generate routes.
- `unlisted` records may generate direct URLs but stay out of public lists and `archive-index.json`.
- Do not change slugs, filenames, `record_id`, `created`, or `type` unless asked.
- Use `external_links` only as documented in `docs/project-linking.md`.

## Theme And Privacy

- Assume the GitHub repo is public; website visibility is not repository privacy.
- Follow `docs/archive-style-guide.md`.
- Follow `docs/privacy-and-public-repo.md`.
- Keep the author anonymous; the work is the identity.
- No corporate voice, influencer voice, or fake hacker theatre.
- State uncertainty honestly with `status`, `confidence`, `last_verified`, and `source_context`.

## Checks

Smallest required check by mode is in `docs/agent-workflow.md`.

Before publishing or pushing broad changes, run:

```bash
npm run agent:check
```

Deployment maintenance also needs:

```bash
npm run deploy:check
```

## Git Workflow

- Run `git status` before committing.
- Work from a clean understanding of `git status`; do not revert changes you did not make.
- Commit only the files needed for the task.
- If unsure whether something is sensitive, leave it uncommitted and report it.
- Commit messages follow the pattern in `docs/agent-workflow.md`.
- Push direct to `main` only when the owner explicitly asks, or for small content/docs fixes after checks pass.
- Use a branch and PR for site features, visual polish, deploy changes, uncertain content changes, or anything that changes routes/design behavior without explicit direct-push instruction.
