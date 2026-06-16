# privacy and public repo

This repository is public. Treat every committed file as published, even when the website does not render it.

## Two Public Surfaces

- GitHub Pages output is the built static site in `out/`, published by Actions.
- Repository source is also public on GitHub.

Website visibility and repository visibility are different. `visibility: "draft"` prevents a static route from being generated; it does not make a committed file private.

## Local-Only Material

`content/inbox/` is for rough capture only. It is ignored except for `.gitkeep`, and the content loader does not read it. Inbox notes are still public if committed, so do not commit them.

Keep these local-only unless explicitly sanitized and moved into the public content model:

- `content/inbox/*`
- `content/private/`
- `docs/private/`
- `notes/private/`
- `scratch/`
- `transcripts/`
- `privacy-blocklist.json`
- `archive-checkin.json`
- `archive-projects.txt`
- `archive-issue.md`
- credentials and `.env*` files
- local agent/tool state folders

Use `privacy-blocklist.example.json` for safe examples. Put real blocked terms only in local `privacy-blocklist.json`.

## Drafts

Drafts inside real content folders may be audited and committed, but they must not contain sensitive material. Move only sanitized writing into `content/entries/`, `content/field-notes/`, `content/build-logs/`, `content/fragments/`, `content/patterns/`, `content/experiments/`, or `content/graveyard/`.

## Agent Rules

Agents must not commit private notes, transcripts, credentials, personal data, private URLs, client-identifying details, or unpublished personal context.

Before committing:

```bash
git status
git ls-files content/inbox
git check-ignore archive-checkin.json archive-projects.txt archive-issue.md
npm run agent:check
```

If unsure whether something is sensitive, leave it uncommitted and report it.
