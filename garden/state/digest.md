# digest

Rolling, human-readable log of what the garden has been doing. Newest at the top. The
orchestrator appends one block per tick. The owner reads this to know what the loop
considered, did, published, and held — the glass box.

Keep entries sanitized. No private detail here.

---

## 2026-06-23 — owner fix: registry now populates the backlog

The loop emptied its queue after the first two articles because intake only promoted a single
seed item — it never turned `archive-projects.txt` into per-source work. Fixed
`garden/scripts/intake.mjs` to enumerate every registered source into one `ready` content
item with an opaque id (`source-<hash>`) and a gitignored `privateRef`; repo identities never
enter committed state. Enumeration is idempotent. Result: 22 source items created, with the
already-published grading-line detector source marked `published`. The draft stage now also
dedupes a source against existing records, which will self-heal the packout-report source
(published on an earlier tick before per-source items existed) when the loop reaches it.

## 2026-06-23 - idle automation tick

No ready backlog items after snapshot refresh and intake. Intake produced no new items; no publishable diffs were present. Tick stopped idle.

## 2026-06-23 - automation tick: finished-batch packout report export

Considered 2 ready items after intake promoted registered-source work. Chose
`seed-first-articles` first because a new de-identified source article has higher garden
value than metadata backfill.

Drafted `content/build-logs/finished-batch-packout-report-export.mdx` from a registered
reporting source. The public record strips source identity, private paths, endpoints,
customer/site labels, sample credentials, and repository names. It preserves the system
shape: finished batches, local desktop/service workflow, PDF/CSV export, idempotent ledger,
retry behavior, and report vocabulary failures.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, secrets, sample credentials, or
  source identifiers in the draft.
- goal-adherence: PASS. Adds a de-identified record of a real operating system and explains
  what it set out to do, how it evolved, what worked, and what remained weak.
- truthfulness: PASS. `working_note` / `partial` fits source-inspection evidence; the record
  states uncertainty through `last_verified` and `source_context`.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no marketing copy.
- significance: PASS. A complete new public build log is worth publishing now.
- validity: PASS. `npm run content:audit`, `npm run privacy:audit`, and
  `npm run garden:moderate -- content/build-logs/finished-batch-packout-report-export.mdx`
  passed. The moderation packet did not include the untracked-file diff, so the manual gate
  treated the audited new file as the draft under review.

Backfilled `points` frontmatter on 7 existing public records and updated their `updated`
dates to `2026-06-23`. No bodies, slugs, record IDs, created dates, types, routes, or
visibility values were changed.

Moderation verdict for `seed-backfill-points`: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed; the batch adds only short
  abstract points derived from already public records.
- goal-adherence: PASS. Makes the supported key-points model real across the original
  archive records and improves scanability without changing meaning.
- truthfulness: PASS. Points summarize existing claims and preserve each record's status and
  confidence.
- theme/voice: PASS. Plain, lowercase where natural, no gloss.
- significance: PASS. Minor per record, but meaningful as one archive-wide metadata batch.
- validity: PASS. `npm run content:audit`, `npm run privacy:audit`, and
  `npm run garden:moderate -- content/entries/why-this-exists.mdx` passed for the tracked
  content-update batch.

Publish checks for the combined diff passed: `npm run content:audit`,
`npm run privacy:audit`, `npm run build`, `npm run pages:verify`, and
`npm run public-output:audit`. Backlog now has 0 ready items after `npm run garden:backlog`
and `npm run garden:snapshot`.

## 2026-06-23 — first supervised article (awaiting owner review)

Owner registered ~23 source repos. Ran a supervised first pass on one of them: a real-time
anomaly detector for a multi-lane grading line. Drafted as a de-identified `build_log`,
`content/build-logs/real-time-anomaly-detection-on-a-grading-line.mdx`.

Moderation (auto-moderation rubric):
- privacy (hard gate): PASS. Stripped the source handle, internal IP/endpoint, internal
  service + API names, the proprietary grade taxonomy, the exact lane count, and HTTP-client
  details. Verified by token scan of the draft. The de-identified subject ("a grading line")
  cannot be traced back.
- goal-adherence: PASS. Grows the de-identified record of the owner's systems; explains what
  it set out to do, how it was built (one session, four commits), what works, what broke.
- truthfulness: PASS. status `working_note` / confidence `partial` reflect a one-night,
  n=1, unhardened build; failures kept, not hidden.
- theme/voice: PASS. lowercase, field-manual, honest; connects to operator-knowledge and
  data-trust records.
- significance: PASS. a complete new article worth publishing.
- validity: PASS. content:audit + privacy:audit green; related slugs resolve.

Verdict: **publish**. Owner approved the supervised first look. Committed (`5aba440`) and
pushed to `main`; Pages deploy triggered. Remaining registered sources handed to the
unsupervised loop.

## 2026-06-22 — bootstrap

The operating layer was installed (not by a tick — by the owner-directed bootstrap).
The garden is ready to run. First real tick will read `garden/ORCHESTRATOR.md`, refresh the
snapshot, run intake, and start on the highest-value `ready` backlog item
(`seed-backfill-points`). Nothing has been published by the loop yet.

## 2026-06-23 - automation tick: static report portal preview

Boot sequence followed: refreshed the garden snapshot, read the backlog, ran intake, and
re-read the backlog. Intake found no new items. The first ready registered source was
self-healed to `published` because an existing public build log already covers that source
system, avoiding a duplicate article.

Drafted `content/build-logs/static-report-portal-preview.mdx` from the next registered
source. The public record strips repository identity, source names, customer labels, file
names, and any private/person-identifying details. It preserves the system shape: a static
browser preview for report review, publication, recipient visibility, approved PDF viewing,
safe notification wording, and the explicit production security boundary.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, credentials, source repository
  names, or un-de-identified details in the draft.
- goal-adherence: PASS. Adds a de-identified build log for a real system, including what it
  set out to demonstrate, what worked, and what is not production-ready.
- truthfulness: PASS. `working_note` / `partial` fits a tested static preview whose
  production boundaries are still explicit. `last_verified` and `source_context` identify
  the evidence without naming the source.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no fake certainty.
- significance: PASS. A complete new public build log is worth publishing now.
- validity: PASS. `npm run content:audit` and
  `npm run garden:moderate -- content/build-logs/static-report-portal-preview.mdx` passed;
  the moderation packet reported content and privacy audits green. The source's own tests
  also passed in an isolated temporary clone.

Publish checks passed: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
`npm run pages:verify`, and `npm run public-output:audit`. Backlog regeneration passed, and
the refreshed snapshot shows 10 public records with 19 ready items remaining for later
ticks.

## 2026-06-23 - automation tick: workbook row to packout PDF

Continued the same wakeup because ready registered-source work remained after the previous
publish. Chose the next ready source and drafted
`content/build-logs/workbook-row-to-packout-pdf.mdx`.

The public record strips repository identity, brand/source names, sample workbook names,
sample grower/customer labels, local paths, and generated output names from the source. It
preserves the system shape: Excel-native PDF export, row-based report generation, workbook
layout validation, bin/lug handling, special product-bucket handling, a Windows desktop
wrapper, installer packaging, and privacy risk in example workbooks and filenames.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, credentials, source repository
  names, brand labels, or sample workbook/output identifiers in the draft.
- goal-adherence: PASS. Adds a de-identified build log for a real reporting bridge and
  explains what it set out to do, what worked, and what remained brittle.
- truthfulness: PASS. `working_note` / `partial` fits a tested but source-specific
  workbook automation. The record states that the workbook layout is a contract and that
  examples/filenames are privacy boundaries.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no fake certainty.
- significance: PASS. A complete new public build log is worth publishing now and connects
  directly to the existing reporting-system records.
- validity: PASS. `npm run content:audit` and
  `npm run garden:moderate -- content/build-logs/workbook-row-to-packout-pdf.mdx` passed;
  the moderation packet reported content and privacy audits green. The source's own unit
  tests passed in an isolated temporary clone.

Publish checks passed: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
`npm run pages:verify`, and `npm run public-output:audit`. Backlog regeneration passed, and
the refreshed snapshot shows 11 public records with 18 ready items remaining for later
loop work.

## 2026-06-23 - automation tick: machine capture to training dataset

Continued the same wakeup on the next ready registered source and drafted
`content/build-logs/machine-capture-to-training-dataset.mdx`.

The public record strips repository identity, exact archive extensions, sample archive
names, sample image names, local paths, third-party tool author details, sample defect
labels, and machine/source identifiers. It preserves the system shape: opaque capture
archives, metadata/payload validation, multi-channel delta decoding, local annotation UI,
SQLite/cache/export storage, and deterministic COCO/YOLO dataset export.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, credentials, source repository
  names, exact sample names, or un-de-identified archive details in the draft.
- goal-adherence: PASS. Adds a de-identified build log for a real machine-vision system and
  explains what it set out to do, what worked, and what stayed risky.
- truthfulness: PASS. `working_note` / `partial` fits a local tool verified against source
  tests, while the record keeps sample-data privacy and dataset-readiness limits visible.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no fake certainty.
- significance: PASS. A complete new public build log is worth publishing now and broadens
  the archive beyond reporting into machine-vision dataset work.
- validity: PASS. `npm run content:audit` and
  `npm run garden:moderate -- content/build-logs/machine-capture-to-training-dataset.mdx`
  passed; the moderation packet reported content and privacy audits green. Source backend
  and frontend tests passed in an isolated temporary clone.

Publish checks passed: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
`npm run pages:verify`, and `npm run public-output:audit`. Backlog regeneration passed, and
the refreshed snapshot shows 12 public records with 17 ready items remaining for later
loop work.

## 2026-06-23 - automation tick: manual label printing from templates

Continued the same wakeup on the next ready registered source and drafted
`content/build-logs/manual-label-printing-from-templates.mdx`.

The public record strips repository identity, exact template filenames, sample field
values, local paths, printer/site specifics, and source labels. It preserves the system
shape: a Windows manual-label utility with bundled templates, explicit load errors for
unsupported template items, bitmap preview/print rendering, saved field values, presets,
per-template layout adjustments, installer setup, and tests around the fragile path.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, credentials, source repository
  names, exact template filenames, sample values, or un-de-identified printer/site details
  in the draft.
- goal-adherence: PASS. Adds a de-identified build log for a real operational desktop
  utility and explains what it set out to do, what worked, and what stayed physically
  dependent on printers and stock.
- truthfulness: PASS. `working_note` / `partial` fits a tested Windows utility whose
  source tests cover rendering and storage behavior, while the record keeps real-printer
  verification limits visible.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no fake certainty.
- significance: PASS. A complete new public build log is worth publishing now and connects
  the reporting/document-generation records to the more tactile manual print workflow.
- validity: PASS. `npm run content:audit` and
  `npm run garden:moderate -- content/build-logs/manual-label-printing-from-templates.mdx`
  passed; the moderation packet reported content and privacy audits green. The source's
  own .NET test suite passed in an isolated temporary clone.

Publish checks passed: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
`npm run pages:verify`, and `npm run public-output:audit`. Backlog regeneration passed, and
the refreshed snapshot shows 13 public records with 16 ready items remaining for later
loop work.

## 2026-06-23 - automation tick: machine metrics collector with commissioning gates

Continued the same wakeup on the next ready registered source and drafted
`content/build-logs/machine-metrics-collector-with-commissioning-gates.mdx`.

The public record strips repository identity, suite/product names, service names, endpoint
hosts, database names, connection strings, serial numbers, local data paths, and source
URLs. It preserves the system shape: a Windows service/CLI that polls a machine endpoint,
writes time-series data, applies database definition files, supervises retry/backoff,
publishes heartbeat state, and gates ingestion on commissioning readiness.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, credentials, source repository
  names, endpoint hosts, database names, serial numbers, or un-de-identified product/suite
  labels in the draft.
- goal-adherence: PASS. Adds a de-identified build log for a real operational collector
  and explains what it set out to do, what worked, and where tooling/commissioning remain
  fragile.
- truthfulness: PASS. `working_note` / `partial` fits the evidence: source core build
  passed in an isolated clone after package restore, while the test project build was
  blocked by a test-framework reference mismatch. The record states that plainly instead
  of claiming a green test run.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no fake certainty.
- significance: PASS. A complete new public build log is worth publishing now and deepens
  the archive's machine-signal/data-trust thread.
- validity: PASS. `npm run content:audit` and
  `npm run garden:moderate -- content/build-logs/machine-metrics-collector-with-commissioning-gates.mdx`
  passed; the moderation packet reported content and privacy audits green.

Publish checks passed: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
`npm run pages:verify`, and `npm run public-output:audit`. Backlog regeneration passed, and
the refreshed snapshot shows 14 public records with 15 ready items remaining for later
loop work.

## 2026-06-23 - automation tick: agent runbook workspace for machine reports

Continued the same wakeup on the next ready registered source and drafted
`content/build-logs/agent-runbook-workspace-for-machine-reports.mdx`.

The public record strips repository identity, workspace/source names, suite/product names,
brand assets, machine serials, endpoint hosts, database names, connection strings, local
paths, source URLs, and private report examples. It preserves the system shape: a routed
agent workspace with instructions, tool docs, reusable scripts, query packs, output
artifact folders, report assembly, technical appendices, and optional PDF rendering.

Moderation verdict: **publish**.
- privacy (hard gate): PASS. `npm run privacy:audit` passed, and manual review found no
  real names, client names, private URLs, private paths, credentials, source repository
  names, workspace-specific boot names, machine serials, endpoint hosts, database names,
  or brand labels in the draft.
- goal-adherence: PASS. Adds a de-identified build log for a real agent operating layer
  and explains what it set out to do, what worked, and why the workspace boundaries matter.
- truthfulness: PASS. `working_note` / `partial` fits a documentation/tooling workspace
  verified by source inspection and a bounded fixture smoke test, not live operational
  report execution.
- theme/voice: PASS. Plain archive voice, no portfolio gloss, no fake certainty.
- significance: PASS. A complete new public build log is worth publishing now because it
  broadens the archive from machine collection into repeatable agent operation.
- validity: PASS. `npm run content:audit` and
  `npm run garden:moderate -- content/build-logs/agent-runbook-workspace-for-machine-reports.mdx`
  passed; the moderation packet reported content and privacy audits green. The source PDF
  fixture smoke test passed in an isolated temporary clone.

Publish checks passed: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
`npm run pages:verify`, and `npm run public-output:audit`. Backlog regeneration passed, and
the refreshed snapshot shows 15 public records with 14 ready items remaining for later
loop work.
