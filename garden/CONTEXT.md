# garden/CONTEXT.md

Layer 1 routing for the Blackbox Garden operating layer. The orchestrator
(`garden/ORCHESTRATOR.md`) reads this to know what stages exist, where state lives, and
which files belong to which layer. Keep this file small; it is loaded every tick.

## layers (MWP)

| layer | role | files |
| --- | --- | --- |
| 0 identity | who you are this tick | `AGENTS.md`, `codex.md`, `garden/ORCHESTRATOR.md` |
| 1 routing | this file: stages, state, policy index | `garden/CONTEXT.md` |
| 2 stage contracts | one job per stage | `garden/stages/*/CONTEXT.md` |
| 3 reference (factory) | stable rules, internalized as constraints | `docs/archive-style-guide.md`, `docs/content-model.md`, `docs/privacy-and-public-repo.md`, `docs/project-linking.md`, `garden/skills/auto-moderation/SKILL.md` |
| 4 working (product) | per-run artifacts, processed as input | intake notes, drafts, `garden/state/*` |

Load only what the current stage names. Layer 3 is the recipe; Layer 4 is the ingredients.

## stages

| stage | folder | job |
| --- | --- | --- |
| 00 intake | `garden/stages/00_intake/` | notes + sources + reader notes -> sanitized backlog items |
| 20 draft | `garden/stages/20_draft/` | backlog item -> de-identified MDX, feature code, or annotation edit |
| 30 moderate | `garden/stages/30_moderate/` | draft -> reasoned verdict (the gate) |
| 40 publish | `garden/stages/40_publish/` | approved change -> commit + push -> deploy |
| 50 annotations | `garden/stages/50_annotations/` | reader notes -> screened, approved, committed JSON |

Numbering is execution order. 10 is intentionally skipped so a future "research/scan"
stage can slot between intake and draft without renumbering.

## state (Layer 4, committed unless noted)

| file | role |
| --- | --- |
| `garden/state/backlog.json` | durable, sanitized work queue (source of truth) |
| `garden/state/backlog.md` | generated human mirror of the backlog |
| `garden/state/garden-snapshot.json` | generated shape of the workspace + archive version |
| `garden/state/catalog.json` | generated inventory (routes, components, lib, scripts, skills) |
| `garden/state/digest.md` | rolling human-readable decision log |
| `garden/state/cycle-log.jsonl` | one JSON line per tick |
| `garden/state/private/` | gitignored: sensitive specifics referenced by id from the backlog |

## sources (Layer 4 inputs)

| source | path | committed? |
| --- | --- | --- |
| article-update notes | `garden/intake/article-updates/` | folder + README + .gitkeep only; raw notes gitignored |
| feature/code requests | `garden/intake/feature-requests/` | folder + README + .gitkeep only; raw notes gitignored |
| sources registry | `archive-projects.txt` (repo root) | gitignored, opt-in; local paths + GitHub repos to scan |
| reader annotations | GitHub Discussions via `scripts/archive-discussions.mjs` | exported JSON in `content/annotations/*.json` is committed |

## tools (npm scripts the orchestrator uses)

| command | does |
| --- | --- |
| `npm run garden:snapshot` | regenerate `garden/state/garden-snapshot.json` |
| `npm run garden:catalog` | regenerate `garden/state/catalog.json` + `docs/workspace-catalog.md` |
| `npm run garden:intake` | fold intake notes + sources + reader notes into the backlog |
| `npm run garden:backlog` | validate / groom the backlog and rewrite `backlog.md` |
| `npm run garden:moderate -- <path-or-slug>` | assemble the moderation evidence packet |
| `npm run agent:check` | full content + privacy + build + pages verification |

## policy index

- decision policy, delegation, model tiers, publishing, stop condition: `garden/ORCHESTRATOR.md`.
- moderation rubric and verdicts: `garden/skills/auto-moderation/SKILL.md`.
- task modes, allowed files, commit messages: `docs/agent-workflow.md`.
- privacy rules: `docs/privacy-and-public-repo.md`.
- content shape: `docs/content-model.md` (points + tags first; sections are guidance).
