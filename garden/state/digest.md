# digest

Rolling, human-readable log of what the garden has been doing. Newest at the top. The
orchestrator appends one block per tick. The owner reads this to know what the loop
considered, did, published, and held — the glass box.

Keep entries sanitized. No private detail here.

---

## 2026-06-22 — bootstrap

The operating layer was installed (not by a tick — by the owner-directed bootstrap).
The garden is ready to run. First real tick will read `garden/ORCHESTRATOR.md`, refresh the
snapshot, run intake, and start on the highest-value `ready` backlog item
(`seed-backfill-points`). Nothing has been published by the loop yet.
