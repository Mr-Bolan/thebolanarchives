# Archive Annotations auto-moderation

Status: Phase F plan only. No auto-moderation is implemented.

## name

Future tooling name: **Archive Intake Screener**.

## goal

Screen public GitHub Discussions intake after a note is posted, then leave a review result
for a human maintainer. The screener does not publish notes to the archive and does not
write to `content/annotations/*.json`.

## screening scope

The screener should flag:

- abusive, hateful, sexual, violent, or self-harm content
- spam, link farming, repeated boilerplate, or low-effort promotion
- credentials, private data, private URLs, private emails, or identifying details
- irrelevant dribble, off-topic comments, or notes with no archive value
- missing or invalid `recordSlug` or `anchorId`
- unsupported claims or comments unrelated to the selected passage
- excessive length for archive marginalia

## architecture options

### A. rules-based local script only

Safest technically: no secrets, no Actions permissions, and easy local dry runs. It does
not screen automatically after public posting, so it should be a development harness, not
the Phase F production shape.

### B. GitHub Actions on discussion events

Best first automation. Run a rules-based screener in GitHub Actions for
`discussion` and `discussion_comment` events in the `archive-annotations` category. Use
the built-in repository token only for review output, and keep permissions as narrow as
GitHub allows.

The Action may create a workflow summary, artifact, label, or triage comment. It must not
commit JSON, publish to the static site, or write directly to `main`.

### C. GitHub Actions plus optional OpenAI moderation

Useful only if rule-based screening misses too much abuse. This adds a secret and sends
submitted text to another service, so it needs a separate decision before use. It remains
server-side in Actions only; never browser-side.

### D. no automation; manual review only

Lowest operational risk, and still the fallback during quiet periods or uncertainty. It
does not meet the Phase F goal of automatic post-submission screening.

## recommendation

Choose **B: GitHub Actions with a rules-based Archive Intake Screener** for Phase F.
Keep **A** as the local dry-run path, defer **C** until there is evidence that rules are
not enough, and keep **D** as the pause/fallback state.

This preserves the static site model and archive anonymity: reader submissions stay in
GitHub, screening happens after the public post, and only reviewed notes manually become
static JSON.

## hard boundaries

Any Phase F automation must:

- run only in GitHub Actions, never in the browser
- use no client-side secrets
- publish no static JSON automatically
- avoid direct writes to `main`
- create a review result only
- keep human approval before publication
- allow intake to be paused by removing the site handoff, locking or closing the category,
  or disabling the screening workflow before it acts

## review result

The first review result should be plain and small:

```text
screen_clear | screen_needs_review | screen_blocked | screen_invalid_target
```

`screen_clear` is not approval. It only means the screener found no obvious blocker.
Maintainers still triage before a note can become `published_static`.

## future flow

```text
submitted -> auto-screened -> triage -> accepted/rejected -> published_static
```

Rejected notes never proceed to `published_static`. Accepted notes still require a human
copy/export into `content/annotations/*.json`, followed by `npm run annotations:audit`,
`npm run agent:check`, and `npm run deploy:check`.

## implementation sketch

When Phase F is approved, the smallest useful implementation is:

- `scripts/archive-intake-screener.mjs`
- `.github/workflows/archive-intake-screener.yml`
- a no-secret rule set for length, URLs, obvious private data, required fields, and target
  anchor validation

Do not add a database, CMS, API route, server action, browser GitHub API call, live comment
fetching, or auto-publish path.
