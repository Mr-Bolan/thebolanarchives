# garden/

The operating layer of the Blackbox Garden. This folder is the framework: the orchestrator
that runs the archive autonomously lives here as plain files, following the Model Workspace
Protocol (MWP) — filesystem structure replaces a coordination framework, scripts do the
mechanical work, one agent reads scoped context per stage.

If you are an agent woken by an automation tick: read `garden/ORCHESTRATOR.md` first.

## map

```
garden/
  ORCHESTRATOR.md     Layer 0 — the tick prompt; read this to become the orchestrator
  CONTEXT.md          Layer 1 — routing: stages, state, policy index
  stages/             Layer 2 — one CONTEXT.md per stage (Inputs/Process/Outputs/Verify)
    00_intake/        notes + sources + reader notes -> sanitized backlog items
    20_draft/         backlog item -> de-identified MDX / feature code / annotation edit
    30_moderate/      draft -> reasoned verdict (the gate)
    40_publish/       approved change -> commit + push -> Pages deploy
    50_annotations/   reader notes -> screened, approved, committed annotation JSON
  skills/
    auto-moderation/  the approval loop: rubric + verdicts (Layer 3 reference)
  scripts/            local tools: snapshot, catalog, intake, backlog, moderate
  intake/             owner drop-boxes (raw note bodies are gitignored)
    article-updates/  notes about an article or page to change
    feature-requests/ notes about code/features to add
  state/              Layer 4 working state
    backlog.json      durable, sanitized work queue (source of truth)
    backlog.md        generated human mirror
    garden-snapshot.json generated shape of the workspace + archive version
    catalog.json      generated inventory
    digest.md         rolling human-readable decision log (the glass box)
    cycle-log.jsonl   one JSON line per tick
    private/          gitignored: sensitive specifics referenced by id
```

## how it runs

An automation (the owner "sends it up") runs an LLM agent on a tick. The agent reads
`ORCHESTRATOR.md`, refreshes the snapshot, runs intake, then works the backlog through the
stages until the stop condition (no `ready` items, no new intake, no publishable diffs).
The owner is never in the commit/push/merge/publish path; the auto-moderation verdict is
the approval.

See `docs/operating-the-garden.md` for the owner's one-page guide.

## what is committed vs local

Committed: the operating layer, sanitized backlog/digest/cycle-log, generated
snapshot/catalog, intake folder structure + READMEs.

Local only (gitignored): raw intake note bodies, `state/private/`, the sources registry
`archive-projects.txt`, blocklist values, credentials.
