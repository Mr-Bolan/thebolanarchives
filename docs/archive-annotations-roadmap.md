# Archive Annotations - Roadmap

Roadmap for Archive Annotations. This is a future feature plan, not permission to build
every phase at once.

## Phase A: static UI prototype

Goal: prove the reading experience without storage risk.

Includes:

- annotation markers
- opened note cards
- note stack behavior
- desktop margin layout
- mobile inline layout
- annotation visibility toggle
- reduced-motion support
- no-JS readable fallback
- hardcoded, sanitized sample notes
- optional archive-lamp effect only if it stays subtle and nonessential

Excludes:

- live submissions
- public user storage
- moderation queues
- real backend

## Phase B: static annotation data

Goal: move sample notes into a clearer static data model.

Includes:

- per-record static annotation data
- deterministic paragraph and heading IDs
- read-only annotations
- static sidecar files under `content/annotations/<record-slug>.json`
- annotation data audit checks

Excludes:

- user submission
- production persistence
- moderation tooling

## Phase C: submission prototype with mock adapter

Goal: test the add-note flow without storing public submissions.

Implementation note: Phase C is mock-only. Submitted notes live in client memory for the
current page session, are marked `mock pending`, and are not published, persisted, or
written back to static annotation JSON.

Includes:

- note composer UI
- paragraph selection or anchor selection
- pseudonym/anonymous choice
- client-side validation
- pending state
- mock adapter only

Excludes:

- production persistence
- committed user submissions
- real moderation queue

## Phase D: backend decision

Goal: choose whether live annotations should exist at all, and if so where they live.

Options to evaluate:

- GitHub Discussions or Issues integration
- Supabase
- Firebase
- Appwrite
- custom lightweight API
- no live backend; keep annotations editorial/static

Decision criteria:

- spam protection
- moderation
- deletion/hide workflow
- abuse handling
- anonymous use policy
- export/archive path
- compatibility with GitHub Pages static hosting

Result: choose GitHub Discussions as a lightweight historical intake and storage layer,
with static JSON remaining the only website render source. This is not an embedded
anonymous comment backend. Reader submissions are public GitHub discussions, reviewed
before publication, and copied or exported into `content/annotations/*.json` only after
moderation.

Decision docs:

- `docs/archive-annotations-backend-decision.md`
- `docs/archive-annotations-moderation-model.md`

## Phase E: GitHub intake + static publication

Goal: production-ready public intake through GitHub Discussions while keeping the archive
site static.

Includes:

- GitHub Discussions category/form intake
- public submission warnings before handoff
- manual triage in GitHub
- accepted notes copied or exported into `content/annotations/*.json`
- `npm run annotations:audit` before publication
- static rendering of reviewed notes only

Excludes:

- auto-moderation
- auto-publish
- browser-side GitHub API calls
- live comment fetching
- database, CMS, API routes, or server actions

Chosen Phase E direction: GitHub Discussions intake plus static publication. See
`docs/archive-annotations-phase-e-plan.md`.

## Phase F: automated intake screening

Goal: screen public GitHub intake after posting without changing the static publication
model.

Includes:

- future Archive Intake Screener
- GitHub Actions review result for new `discussion` / `discussion_comment` events
- rules for abuse, spam, private data, invalid targets, off-topic notes, unsupported
  claims, and excessive length
- human triage before acceptance
- pause path for intake or screening

Excludes:

- browser-side moderation
- client-side secrets
- automatic writes to `content/annotations/*.json`
- direct writes to `main`
- automatic publication on the static site

Recommendation: start with GitHub Actions plus rules-based screening, keep local script
mode as the dry run, and defer optional OpenAI moderation until there is evidence that
rules are not enough. See `docs/archive-annotations-auto-moderation.md`.

## Anti-goals

- no embedded/custom backend yet
- no browser-side direct writes to GitHub
- no public submission storage inside the repository or static site
- no database
- no CMS
- no search
- no route redesign
- no social-media-style comment system
- no social profiles
- no likes, scores, reactions, or engagement metrics
- no required flashlight or archive-lamp effect
- no committed private notes or real user submissions
