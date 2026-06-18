# Archive Annotations auto-moderation

Status: implemented as a rules-based GitHub Actions screener.

## name

Tooling name: **Archive Intake Screener**.

## goal

Screen GitHub Discussion comments for archive annotations and export only clear notes into
static annotation JSON. The archive remains a static site: GitHub Discussions hold the
public conversation, while `content/annotations/*.json` remains the only render source.

## commands

```bash
npm run discussions:self-check
npm run discussions:sync
npm run discussions:export
```

- `discussions:self-check` validates parser and screening behavior without a GitHub token.
- `discussions:sync` ensures each public or unlisted archive record has a GitHub
  Discussion in `archive-annotations`, falling back to `general` if the custom category
  has not been created yet, then updates `content/annotation-discussions.json`.
- `discussions:export` reads comments from mapped discussions, screens them, and writes
  only `screen_clear` notes into `content/annotations/<record-slug>.json`.

GitHub API commands require `GITHUB_TOKEN` or `GH_TOKEN`.

## workflows

- `.github/workflows/archive-discussions-sync.yml` runs on `main` content changes or
  manually. It creates missing per-record discussions and opens a PR when the discussion
  registry changes.
- `.github/workflows/archive-intake-screener.yml` runs on annotation or fallback
  Discussion/comment events or manually. It syncs the registry, exports clear notes,
  audits annotations, and opens a PR with static JSON changes.

The workflows do not write directly to `main`.

## screening states

```text
screen_clear
screen_needs_review
screen_blocked
screen_invalid_target
```

`screen_clear` means the note passed the rules-based checks and can be exported into a PR
without manual copy work. It is still reviewed at PR time before publication.

`screen_needs_review`, `screen_blocked`, and `screen_invalid_target` stay in GitHub and do
not render on the archive.

## screening scope

The screener checks for:

- missing or mismatched record slug
- missing or invalid anchor ID
- draft or unknown target records
- note bodies that are too short or too long for archive marginalia
- overly long excerpts or display names
- URLs, emails, private hosts, credentials, private keys, API-key shapes, and placeholders
- common spam or promotional phrases
- safety-sensitive, abuse-sensitive, or identifying claims that need human review

The rule set is intentionally conservative. It is not a full trust engine, legal review,
or abuse classifier.

## hard boundaries

The automation must:

- run in GitHub Actions or local maintainer tooling, never in the browser
- use no client-side secrets
- keep the site static
- write generated archive notes only through a PR
- preserve the source GitHub comment URL on exported annotations
- leave blocked, invalid, or uncertain comments out of static JSON
- allow intake to be paused by disabling the workflows, removing the site handoff, or
  locking the category

## publication flow

```text
record published -> sync creates record discussion -> reader replies with prepared note
-> screener exports clear comments -> PR review -> static archive render
```

Rejected or uncertain comments never proceed to static JSON unless a maintainer edits or
manually curates them into a safe annotation.
