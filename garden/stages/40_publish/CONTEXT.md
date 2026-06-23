# stage 40 — publish

One job: take a change with a `publish` verdict and ship it — commit, push, let GitHub
Pages deploy. The owner is never asked. The moderation verdict is the approval.

## Inputs

- Layer 4 (working): the approved change (clean working tree diff) and its backlog item.
- Layer 3 (reference): `docs/agent-workflow.md` — required checks and commit-message
  pattern per mode.
- Layer 3 (reference): `docs/deploy.md` — deploy model (static export, GitHub Pages,
  basePath).

## Process

1. Confirm the verdict is `publish` (stage 30). No verdict, no publish.
2. Run the required checks for the change's mode:
   - content changes: `npm run content:audit`, `npm run privacy:audit`, `npm run build`,
     `npm run pages:verify`.
   - site features: `npm run agent:check`.
   - if any check fails: stop. Send the item to `20_draft` (revise) or the backlog. Never
     publish a failing change.
3. Stage only the files this change needs. Never `git add -A` blindly; never stage
   gitignored or private paths.
4. Commit with the mode's message pattern from `docs/agent-workflow.md`
   (e.g. `draft content: <slug>`, `publish content: <slug>`, `add site feature: <feature>`).
5. Push to `main`. The `deploy-pages.yml` workflow builds and deploys. Batch related small
   changes into one publish where they read as one update.
6. Mark the backlog item `done` — except a registry `source-*` item, which becomes
   `published` so intake never re-queues that source. Append to `garden/state/digest.md` and
   `garden/state/cycle-log.jsonl`.

## Outputs

- One or more commits on `main`, pushed.
- Updated backlog (`done`), digest, cycle log.

## Verify

- Required checks passed before commit.
- Only intended, non-gitignored files were committed (`git status` clean after).
- The deploy was triggered by the push (no extra manual step).
- If a check failed, nothing was pushed and the item was routed back.
