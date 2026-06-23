# content-model.md

Content contract for `thebolanarchives`.

This document defines the MDX frontmatter and writing patterns for the archive. It does not create content files.

## final frontmatter schema

Every published MDX file uses this frontmatter shape:

```yaml
title: "the dashboard was lying"
slug: "the-dashboard-was-lying"
type: "field_note"
status: "working_note"
confidence: "partial"
summary: "A note about why dashboards can show data without creating understanding."
created: "2026-06-14"
updated: "2026-06-14"
tags:
  - dashboards
  - data
  - systems
tools:
  - postgresql
  - grafana
  - field observation
narrative_origin: "machine room"
visibility: "public"
related:
  - "layer-zero"
  - "operator-knowledge-as-data"
```

Optional fields:

```yaml
record_id: "field_note_003"
series: "dashboard truth"
sequence: 2
last_verified: "2026-06-14"
source_context: "operator observation during a production run"
points:
  - "dashboards can show data without creating understanding"
  - "the operator's signal set is wider than the data model"
aliases:
  - "dashboard-truth"
external_links:
  - label: "project repository"
    url: "https://github.com/Mr-Bolan/example-project"
    kind: "repository"
```

`points` are the key claims or takeaways specific to this page. They render as a short
"key points" block near the top of the record and make the archive scannable. Prefer
`points` and page-relevant `tags` over forcing every record into the same section
structure. `points` is optional and can be added to any record at any time.

## required vs optional fields

Required for all public or unlisted content:

| field | type | notes |
| --- | --- | --- |
| `title` | string | human title, lowercase preferred |
| `slug` | string | unique URL slug, must match filename |
| `type` | enum | one content type |
| `status` | enum | one maturity status |
| `confidence` | enum | one confidence level |
| `summary` | string | plain 1-2 sentence description |
| `created` | date string | `YYYY-MM-DD` |
| `updated` | date string | `YYYY-MM-DD` |
| `tags` | string array | can be empty only for drafts |
| `tools` | string array | can be empty |
| `narrative_origin` | string | where the record came from |
| `visibility` | enum | `public`, `unlisted`, or `draft` |
| `related` | string array | related slugs, can be empty |

Optional fields:

| field | type | notes |
| --- | --- | --- |
| `record_id` | string | stable archive label such as `entry_001` |
| `series` | string | shared theme across multiple records |
| `sequence` | number | order within a series |
| `last_verified` | date string | useful for technical claims |
| `source_context` | string | short evidence context |
| `points` | string array | key claims/takeaways specific to this page; render as a "key points" block |
| `aliases` | string array | old names or alternate slugs |
| `external_links` | object array | public project/artifact links; see `docs/project-linking.md` |

## validation rules

General:

- `slug` must be lowercase kebab-case.
- `slug` must match the MDX filename.
- `type` must match the folder.
- `created`, `updated`, and `last_verified` must be `YYYY-MM-DD`.
- `updated` must be the same as or later than `created`.
- `summary` should be 80-220 characters.
- `tags`, `tools`, `related`, `aliases`, and `points` must be arrays of strings.
- `external_links`, when present, must use `label`, `url`, and `kind`.
- `tags` should be lowercase kebab-case.
- `related` must not include the current `slug`.
- `related` slugs should resolve to existing content before launch.
- `visibility: draft` content is excluded from static route generation.
- public content should avoid personal identifying details; the work is the identity.

Content rules:

- `fragment` content should normally use `status: fragment` or `status: sketch`.
- `graveyard_note` content should normally use `status: retired`.
- `experiment` content must include a static written explanation even if it later embeds an interactive module.
- `field_confirmed` confidence should include either `last_verified`, `source_context`, or clear evidence in the body.
- `record_id`, when present, must be stable and not generated from list order.
- `external_links` URLs must be public `http` or `https` URLs.

Route mapping:

| type | folder | route |
| --- | --- | --- |
| `entry` | `content/entries/` | `/entries` |
| `field_note` | `content/field-notes/` | `/field-notes` |
| `build_log` | `content/build-logs/` | `/build-logs` |
| `fragment` | `content/fragments/` | `/fragments` |
| `pattern` | `content/patterns/` | `/patterns` |
| `experiment` | `content/experiments/` | `/experiments` |
| `graveyard_note` | `content/graveyard/` | `/graveyard` |

## content type definitions

The emphasis notes below are optional guidance, not a required structure. Shape each record
to its actual content. Lead with `points` and page-relevant `tags`; add only the sections a
record genuinely needs. The hard rules are the frontmatter schema and the privacy rules, not
a fixed body outline. Two records of the same type may look quite different — that is fine.

### `entry`

A longer archive article. Use for essays, explanations, retrospectives, and records that need narrative structure.

Suggested emphasis (optional): what this is, why it exists, what happened or was built, what broke, what is understood now, open questions.

### `field_note`

A real-system observation from machines, data, people, operators, workflows, or technical environments.

Suggested emphasis (optional): evidence, context, observed behavior, uncertainty, and what the observation suggests.

### `build_log`

A record of something being made.

Suggested emphasis (optional): goal, current state, decisions, failures, next step, and whether the build is active, paused, or retired.

### `fragment`

A small thought that may grow later.

Suggested emphasis (optional): speed and clarity. Fragments do not need full article structure.

### `pattern`

A reusable mental model or framework.

Suggested emphasis (optional): definition, when it applies, what it helps explain, limits, and related examples.

### `experiment`

An interactive or technical prototype.

Suggested emphasis (optional): question, controls or variables, what changes when assumptions change, static fallback explanation, and limits.

### `graveyard_note`

A record of abandoned, retired, failed, or replaced work.

Suggested emphasis (optional): why it died, what was learned, what replaced it, and what remains useful.

## maturity status definitions

| status | meaning | display tone |
| --- | --- | --- |
| `fragment` | raw thought, not yet shaped | quiet, incomplete |
| `sketch` | early structure exists, still rough | exploratory |
| `working_note` | useful but incomplete | active record |
| `field_tested` | used against reality in some way | evidence-backed |
| `stable_artefact` | reusable and relatively mature | strongest ordinary status |
| `retired` | no longer active, preserved for record | muted, honest |

Rules:

- status describes maturity, not visibility.
- unfinished statuses are normal and should be visible.
- never hide uncertainty by upgrading status for polish.

## confidence level definitions

| confidence | meaning | when to use |
| --- | --- | --- |
| `low` | plausible but weakly supported | first impressions, rough guesses |
| `partial` | some evidence, not enough to generalize | field notes, early experiments |
| `medium` | reasonably supported | repeated observations or tested builds |
| `high` | strong evidence and few known caveats | mature patterns or proven notes |
| `field_confirmed` | confirmed against real-world operation | operational evidence, repeated use |

Rules:

- confidence describes claim strength, not writing quality.
- `field_confirmed` is reserved for claims tested outside the page.
- low-confidence content can still be useful if labeled honestly.

## standard post template

```mdx
---
title: "the dashboard was lying"
slug: "the-dashboard-was-lying"
type: "field_note"
status: "working_note"
confidence: "partial"
summary: "A note about why dashboards can show data without creating understanding."
created: "2026-06-14"
updated: "2026-06-14"
tags:
  - dashboards
  - data
tools:
  - grafana
  - postgresql
narrative_origin: "machine room"
visibility: "public"
related:
  - "layer-zero"
---

# field_note_003 // the_dashboard_was_lying

<ArchiveMetaCard />

## what this is

Short plain explanation.

## why it exists

The problem, irritation, question, or situation that caused the record.

## what i noticed

The observation, build, system behavior, or idea.

## what worked

The useful part.

## what broke

The failure, weak assumption, or missing signal.

## what i understand now

The pattern or lesson.

## open questions

<OpenQuestions questions={[
  "What would prove this wrong?",
  "Which signal is still missing?"
]} />

## related artefacts

<RelatedArtifacts />
```

## standard fragment template

```mdx
---
title: "you pay for the problem that disappears"
slug: "you-pay-for-the-problem-that-disappears"
type: "fragment"
status: "fragment"
confidence: "partial"
summary: "A short note about valuing solved problems rather than visible effort."
created: "2026-06-14"
updated: "2026-06-14"
tags:
  - work
tools: []
narrative_origin: "private note"
visibility: "public"
related: []
---

# fragment // you_pay_for_the_problem_that_disappears

<ArchiveMetaCard compact />

You do not pay for the number of hours.
You pay for the size of the problem that disappears.
```

## example MDX files

### `content/entries/why-this-exists.mdx`

```mdx
---
title: "why this exists"
slug: "why-this-exists"
type: "entry"
status: "working_note"
confidence: "medium"
summary: "The opening record for an anonymous archive of systems, tools, fragments, and things understood later."
created: "2026-06-14"
updated: "2026-06-14"
tags:
  - archive
  - unfinished-work
  - build-logs
tools: []
narrative_origin: "personal archive"
visibility: "public"
related: []
record_id: "entry_001"
---

# entry_001 // why_this_exists

<ArchiveMetaCard />

## what this is

This archive is not a portfolio.
It is a record of things built, broken, tested, abandoned, and understood later.

## why it exists

Because useful work keeps disappearing into memory unless it is written down.

## what i understand now

The point is not to look finished.
The point is to leave a trail.
```

### `content/field-notes/the-operator-knows-before-the-database-does.mdx`

```mdx
---
title: "the operator knows before the database does"
slug: "the-operator-knows-before-the-database-does"
type: "field_note"
status: "sketch"
confidence: "partial"
summary: "A field note about human observation as a richer signal set than the data model sometimes captures."
created: "2026-06-14"
updated: "2026-06-14"
tags:
  - operators
  - data
  - machine-signals
tools:
  - field observation
narrative_origin: "machine room"
visibility: "public"
related:
  - "layer-zero"
record_id: "field_note_001"
---

# field_note_001 // the_operator_knows_before_the_database_does

<ArchiveMetaCard />

## what this is

An observation about the gap between measured data and lived system awareness.

## what i noticed

The operator usually knows something is wrong before the database does.
Not because the operator is mystical.
Because the operator is watching a richer signal set.
```

### `content/experiments/dashboard-truth-meter.mdx`

```mdx
---
title: "dashboard truth meter"
slug: "dashboard-truth-meter"
type: "experiment"
status: "sketch"
confidence: "low"
summary: "An interactive explanation of the distance between data existing and data supporting action."
created: "2026-06-14"
updated: "2026-06-14"
tags:
  - dashboards
  - data-quality
  - explanations
tools: []
narrative_origin: "dashboard notes"
visibility: "public"
related:
  - "the-dashboard-was-lying"
record_id: "experiment_001"
---

# experiment_001 // dashboard_truth_meter

<ArchiveMetaCard />

## what this is

A future interactive model for showing the steps between raw data and useful operational truth.

<ExperimentFrame fallback="Static explanation: data can exist, be clean, be trusted, explain a problem, or support action. Those are different states." />

## open questions

<OpenQuestions questions={[
  "Which states should be visible first?",
  "What example data makes the model obvious?"
]} />
```
