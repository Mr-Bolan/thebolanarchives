# digest

Rolling, human-readable log of what the garden has been doing. Newest at the top. The
orchestrator appends one block per tick. The owner reads this to know what the loop
considered, did, published, and held — the glass box.

Keep entries sanitized. No private detail here.

---

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
