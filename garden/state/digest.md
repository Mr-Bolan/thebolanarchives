# digest

Rolling, human-readable log of what the garden has been doing. Newest at the top. The
orchestrator appends one block per tick. The owner reads this to know what the loop
considered, did, published, and held — the glass box.

Keep entries sanitized. No private detail here.

---

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

Verdict: **publish** — held at owner's request for a supervised first look before the loop
runs unsupervised. Not committed or pushed.

## 2026-06-22 — bootstrap

The operating layer was installed (not by a tick — by the owner-directed bootstrap).
The garden is ready to run. First real tick will read `garden/ORCHESTRATOR.md`, refresh the
snapshot, run intake, and start on the highest-value `ready` backlog item
(`seed-backfill-points`). Nothing has been published by the loop yet.
