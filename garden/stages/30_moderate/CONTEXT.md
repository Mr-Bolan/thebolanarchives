# stage 30 — moderate (the gate)

One job: decide whether a draft advances the goal and is safe to publish. This is the only
path to stage 40. Use the strongest tier for the final verdict.

## Inputs

- Layer 4 (working): the draft (changed files) and its backlog item.
- Layer 3 (reference): `garden/skills/auto-moderation/SKILL.md` — the rubric and verdicts.
- Layer 4 (working): the evidence packet from `npm run garden:moderate -- <path-or-slug>`
  (runs content/privacy/annotations audits and gathers the diff + metadata).

## Process

1. Run `npm run garden:moderate -- <path-or-slug>` to assemble the evidence packet.
2. Apply the auto-moderation rubric. Reason about each dimension; do not reduce to one
   number:
   - goal-adherence — does this grow the de-identified record of the owner's systems?
   - privacy / identity — HARD GATE. Any possible real name, client, private path/URL,
     secret, or un-de-identified detail forces a privacy trip.
   - truthfulness — status/confidence honest; uncertainty marked, not hidden.
   - theme / voice — anonymous, lowercase where natural, no gloss, no corporate or hacker
     theatre.
   - significance / effectiveness — is this worth a publish now, or should it batch?
   - structural validity — audits green, in-mode, related slugs resolve.
3. Produce one verdict:
   - `publish` — advances the goal, safe, significant enough -> stage 40.
   - `revise` — close but flawed -> back to stage 20 with specific notes.
   - `hold-backlog` — valid but not significant yet, or blocked on another item ->
     `status: deferred`/`blocked` in the backlog.
   - `reject` — out of scope or wrong -> close the item with a reason.
4. On a privacy trip: never publish. File a sanitized remediation item (sensitive
   specifics by id in `garden/state/private/`). Continue the loop on other items.
5. Write the verdict and reasoning to `garden/state/digest.md`.

## Outputs

- A verdict recorded on the backlog item and in the digest.
- For `publish`: a clean change ready for stage 40.
- For `revise`/`hold`/`reject`: updated backlog item, nothing published.

## Verify

- A privacy trip can never produce a `publish` verdict.
- Every verdict has written reasoning in the digest.
- `publish` verdicts have passing audits in the evidence packet.
