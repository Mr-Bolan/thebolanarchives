# operating the garden

One page. How to run the Blackbox Garden without being in the loop.

## the idea

You drop a note or register a project. An automation runs an agent on a tick. The agent
reads `garden/ORCHESTRATOR.md`, becomes the orchestrator, and loops: intake -> draft
(de-identified) -> auto-moderate -> publish -> repeat, until there is no work left. You are
never in the commit, push, merge, or publish path. The auto-moderation verdict is the
approval.

## the two drop-boxes

When you notice something you want to change, you do not edit the site. You leave a note:

- want an article or page changed/fixed/retired? drop a markdown file in
  `garden/intake/article-updates/`.
- want a feature, code change, or fix? drop a markdown file in
  `garden/intake/feature-requests/`.

Write in your own words. Mention sensitive details plainly — raw note bodies are gitignored
and the loop de-identifies before anything is committed. Each folder's `README.md` shows an
optional format, but freeform is fine. The next tick converts notes into sanitized backlog
items and archives the raw note.

## registering a project to write about

To let the garden write de-identified articles about your work, add the repo to the
sources registry:

1. Copy `archive-projects.example.txt` to `archive-projects.txt` (gitignored, local-only).
2. Add one source per line: a local path (`../my-project`) or a GitHub repo
   (`github owner/repo`). Remote reads use your `GITHUB_TOKEN` / `GH_TOKEN`.
3. The next tick scans it and files article work into the backlog.

The registry starts empty. The garden scans nothing until you opt a source in.

## what a tick does

1. reads `garden/ORCHESTRATOR.md` + `garden/CONTEXT.md`.
2. refreshes `garden/state/garden-snapshot.json` (the shape of the workspace).
3. runs intake (`npm run garden:intake`): notes + sources + reader notes -> backlog.
4. picks the highest-value ready item, drafts it de-identified, and auto-moderates it.
5. publishes when the change is significant (new article, real update, finished feature,
   fix, or approved reader notes) — never on a fixed timer, never asking you.
6. stops (idle heartbeat) when the backlog has no ready items, intake produced nothing, and
   there are no publishable diffs.

## reading what it did

- `garden/state/digest.md` — plain-language log of what each tick considered, did,
  published, and held, and why. This is the glass box; read this first.
- `garden/state/backlog.json` / `backlog.md` — the work queue and its statuses.
- `docs/workspace-catalog.md` — generated inventory of routes, components, scripts, skills.

## steering it

- veto or reprioritize: edit `garden/state/backlog.json` (set an item's `status` to
  `deferred`, or drop it), then run `npm run garden:backlog` to refresh the mirror. The loop
  respects the backlog.
- privacy: if moderation flags a possible identity leak, it never publishes that item. It
  files a remediation item and keeps going; it reworks the item on a later tick until it
  passes. You do not need to intervene.
- reader notes: approved GitHub Discussion comments are committed to `main` by the loop and
  render on the next deploy. No PR merge needed.

## reader annotations (notes on the live site)

Reader comments on the GitHub Discussion for a record are screened, then approved by the
auto-moderation skill, then committed to `content/annotations/*.json` on `main` so they
render. The old manual PR-merge path (`archive-intake-screener.yml`) is now a dispatch-only
fallback; the loop owns this.

## the only thing you set up

The automation that runs the tick. Point your runner (e.g. a Codex/CI job on a schedule or
trigger) at a single instruction: read `garden/ORCHESTRATOR.md` and act as the orchestrator.
Everything else — context, tools, state, decisions — lives in `garden/`.
