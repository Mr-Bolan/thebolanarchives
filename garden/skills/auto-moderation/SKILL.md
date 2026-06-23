---
name: auto-moderation
description: "The Blackbox Garden approval loop. Use this skill to decide, without a human in the loop, whether a change should be published to the live archive. Reasons about purpose, effectiveness, and adherence to the goal rather than a single numeric score. Produces one verdict per item: publish | revise | hold-backlog | reject. Covers: archive articles and updates (MDX), site features and code, and reader annotations exported from GitHub Discussions. Enforces a hard privacy/identity gate, honest uncertainty, the anonymous Blackbox Garden voice, and significance-based publishing. Inputs: a draft or change plus the evidence packet from `npm run garden:moderate`. Use on stage 30 (moderate) and stage 50 (annotations) of the garden loop."
---

# Auto-Moderation — the approval loop

This skill replaces the human "approve to publish" click. It is read by the orchestrator
at stage 30 (`garden/stages/30_moderate/CONTEXT.md`) and for reader notes at stage 50.

The design intent comes from auto-reasoning research (reasoning about whether an action
advances a goal) rather than a bare reward score. We do not output a number and threshold
it. We reason about each dimension, weigh them, and commit to a verdict with written
justification that lands in `garden/state/digest.md`. That justification is the audit
trail — the glass box.

## When to Apply

### Must Use

- Before any change is published to `main` / the live site (stage 40 only runs after a
  `publish` verdict here).
- When deciding whether a reader annotation may render on the site (stage 50).
- When a draft returns from `revise` and needs re-adjudication.

### Recommended

- When grooming the backlog and unsure whether an item is worth doing now.
- When two ready items conflict and you must choose which keeps the site publishable.

### Skip

- Pure intake parsing (stage 00) — no publish decision is being made.
- Regenerating snapshot/catalog — mechanical, nothing leaves the workspace.

**Decision criteria**: if the action would put bytes in front of a reader, this skill
decides.

## The verdicts

| verdict | meaning | routes to |
| --- | --- | --- |
| `publish` | advances the goal, safe, significant enough to deploy now | stage 40 publish |
| `revise` | close, but a fixable flaw | stage 20 draft, with specific notes |
| `hold-backlog` | valid but not significant yet, or blocked on another item | backlog (`deferred` / `blocked`) |
| `reject` | out of scope, wrong, or unsalvageable | close item with reason |

Exactly one verdict per item. Never publish without it.

## Rule Categories by Priority

Reason 1 -> 6. Earlier categories dominate: a failure in 1 cannot be outweighed by strength
in 4. Privacy is an absolute gate, not a weight.

| Priority | Category | Weight | Must Hold | Anti-Patterns |
| --- | --- | --- | --- | --- |
| 1 | Privacy / identity | HARD GATE | No real names, clients, private paths/URLs, secrets, or un-de-identified repo detail. The work is the identity. | Publishing a leak; "probably fine"; trusting source material was already clean |
| 2 | Goal-adherence | CRITICAL | Grows the de-identified record of the owner's systems; shows what something set out to do, how it evolved, what works/does not | Off-topic content; portfolio gloss; filler that does not advance the archive |
| 3 | Truthfulness / honesty | CRITICAL | status + confidence match reality; uncertainty marked (`last_verified`, `source_context`); failures kept, not hidden | Upgrading maturity for polish; deleting the "what broke" section; false certainty |
| 4 | Theme / voice | HIGH | Anonymous, lowercase where natural, plain field-manual tone, no gloss | Corporate blog voice; influencer thread; fake hacker theatre; marketing hero |
| 5 | Significance / effectiveness | HIGH | Worth a deploy now: new article, meaningful update, completed feature, fix, or approved note(s) | Publishing a trivial or in-progress change just because a tick fired |
| 6 | Structural validity | HIGH | Audits green; in one task mode; related slugs resolve; frontmatter complete | Out-of-mode edits; broken links; failing `content:audit` |

## How to Use

1. Get the evidence packet: `npm run garden:moderate -- <path-or-slug>`. It runs
   `content:audit`, `privacy:audit`, and (for notes) `annotations:audit`, and gathers the
   diff + frontmatter + the backlog item. Read it instead of re-deriving everything.
2. Walk the priority table top-down. Stop and decide as soon as a hard gate fails:
   - Privacy gate fails -> **privacy trip** (see below). Never `publish`.
   - Goal/truth fails badly -> `reject` or `revise`.
3. If all gates hold, weigh significance:
   - significant now -> `publish` (batch related small changes into one publish).
   - valid but minor / better batched -> `hold-backlog` (`deferred`).
4. Write the verdict and the reasoning (one short paragraph per non-trivial dimension) to
   `garden/state/digest.md`. A bare verdict with no reasoning is not allowed.

## Privacy trip (the most important path)

When priority 1 flags anything possibly identifying:

1. Do NOT publish the item. No exceptions, no override.
2. File a sanitized remediation item back into `garden/state/backlog.json`:
   - `type: "privacy"`, `status: "ready"`, a sanitized `summary` of what must be fixed.
   - put the sensitive specifics in `garden/state/private/<id>.md` (gitignored) and
     reference them by id from the backlog item. Never inline them.
3. Keep the loop running on every other item.
4. On a later tick, the draft stage reworks the item; this skill re-adjudicates. It
   publishes only once the gate holds.

A privacy trip is the system working as designed. It is logged as a held item, not an
error.

## Annotation screening (stage 50)

Reader notes arrive pre-screened by `scripts/archive-discussions.mjs` into one of
`screen_clear | screen_needs_review | screen_blocked | screen_invalid_target`.

- `screen_clear` + a `publish` verdict here = approved for the site. This is the approval
  that was previously a human PR merge.
- `screen_needs_review` / `screen_blocked` / `screen_invalid_target` never reach the site.
  If one needs owner attention, file a backlog item (sanitized).
- Apply the same priority table, plus: the note must anchor to a real record + anchor, stay
  marginalia-length, preserve its source GitHub comment URL, and carry no URLs/emails/PII.

## Significance heuristics (priority 5)

Publish-worthy now:

- a new public/unlisted record reaches `working_note` or better and reads complete enough;
- an update changes meaning, status, or a claim (not a typo on an obscure line);
- a site feature is complete and `agent:check` is green;
- a broken thing is fixed;
- one or more reader notes are approved.

Better to hold and batch:

- partial drafts, mid-refactor states, cosmetic-only tweaks with no reader impact, or a
  series of tiny edits that read better as one update.

## Pre-Verdict Checklist

- [ ] Privacy gate explicitly checked against the diff (not assumed).
- [ ] Verdict is one of publish / revise / hold-backlog / reject.
- [ ] Reasoning written to the digest.
- [ ] If `publish`: required audits for the change's mode are green in the packet.
- [ ] If privacy trip: remediation item filed, specifics in `state/private/`, nothing
      published.
- [ ] Backlog item status updated to match the verdict.
