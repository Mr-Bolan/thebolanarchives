# backlog (generated)

Generated mirror of `garden/state/backlog.json`. Do not edit by hand — run
`npm run garden:backlog` to regenerate. Edit the JSON instead.

Last generated: 2026-10-05

## ready

_(none)_

## needs-source

_(none)_

## in-progress

_(none)_

## blocked

- **restore an unavailable source before drafting** (`inventory-hold-01-20261005`, content, low)
  Source evidence is unavailable at its recorded location. Resume only when a readable replacement or restored source is provided.

## deferred

- **de-duplicate frontmatter validation (content.ts vs content-audit.mjs)** (`seed-dedupe-frontmatter-validation`, refactor, low)
  Two parallel implementations risk drifting: (1) frontmatter validation in src/lib/content.ts (readContentFile) vs scripts/content-audit.mjs; (2) the archive-graph builder in src/lib/graph.ts (buildArchiveGraph) vs garden/scripts/lib/garden-core.mjs (buildArchiveGraphFromRecords). Extract shared validators/builders so TS and node scripts cannot disagree. Risky because the first gates publishing; do it carefully behind agent:check.

- **expand the Blackbox Garden graph (reverse-index + series edges)** (`seed-graph-expansion`, graph, low)
  After the base graph ships, add a reverse-index (records linking here), series/sequence edges, and tag-weighted layout so the map gets richer as the archive grows.

- **draft a de-identified article from a registered source** (`source-e630bf49`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **establish provenance for isolated report templates** (`inventory-hold-02-20261005`, content, low)
  Report templates lack a verified producer or distinct implementation history. Hold until provenance supports a useful independent record.

- **identify bounded implementation evidence for a support workspace** (`inventory-hold-03-20261005`, content, low)
  Reviewed support metadata does not establish a distinct software implementation. Resume with a bounded source that can be inspected without private operational notes.

- **reconcile an isolated source copy** (`inventory-hold-04-20261005`, content, low)
  A copied component overlaps existing coverage but lacks a verified canonical counterpart or meaningful change. Resume when provenance and a distinct technical contribution are established.

- **establish distinct evidence for a rendering package** (`inventory-hold-05-20261005`, content, low)
  Packaged rendering assets do not establish a distinct project history beyond existing document tooling. Hold until a maintained source and substantive change are available.

## done

- **backfill points frontmatter on existing records** (`seed-backfill-points`, content, medium)
  Add an optional points list (key claims relevant to each page) to the 7 existing public records so the key-points block renders and the schema-softening is real, not just supported.

- **write first de-identified articles from a registered source** (`seed-first-articles`, content, high)
  Once the owner registers a local repo path or GitHub repo in archive-projects.txt, scan it and write the first de-identified build-log / entry about what it set out to do, how it evolved, how long it has been worked on, what works, what does not, and any novel idea worth a diagram.

- **make the garden graph inspectable** (`intake-feature-grab-and-manipulate-graph-garden`, feature, medium)
  Add pan, zoom, node dragging, keyboard nudging, and tag activation to the /garden graph so dense clusters can be inspected without changing routes or adding dependencies.

- **update the about page origin note** (`intake-content-about-update`, content, medium)
  De-identify and rewrite the about page so it explains the archive's AI-assisted working origin without exposing private biography, employers, or clients.

- **draft the meeting notes workflow experiment** (`intake-content-update-repos`, content, medium)
  Draft a de-identified experiment record from the local meeting-note automation source, emphasizing workflow impact while keeping transcripts, names, clients, paths, and credentials out of public content.

- **move article tags with dragged graph records** (`intake-feature-garden-map`, feature, medium)
  Fix the garden graph drag behavior so a dragged record carries its directly connected tag nodes, making shared tag relationships easier to inspect without changing routes or data shape.

- **review project inventory and draft evidenced archive content** (`intake-content-project-inventory-2026-10-05`, content, medium)
  Reconciled 221 source inventory rows; produced 34 new records and 3 meaningful updates, registered 35 verified sources, and retained 5 evidence-based holds. Raw inventory and source identities remain private.

- **review documents sources** (`inventory-review-documents-20261005`, content, medium)
  Verify source evidence, reconcile existing records, and draft distinct de-identified content. Source details and row-level outcomes remain in ignored private state.

- **review analysis sources** (`inventory-review-analysis-20261005`, content, medium)
  Verify source evidence, reconcile existing records, and draft distinct de-identified content. Source details and row-level outcomes remain in ignored private state.

- **review research sources** (`inventory-review-research-20261005`, content, medium)
  Verify source evidence, reconcile existing records, and draft distinct de-identified content. Source details and row-level outcomes remain in ignored private state.

- **review previously indexed sources** (`inventory-review-existing-20261005`, content, medium)
  Verify source evidence, reconcile existing records, and draft distinct de-identified content. Source details and row-level outcomes remain in ignored private state.

- **review additional local sources** (`inventory-review-misc-20261005`, content, medium)
  Verify source evidence, reconcile existing records, and draft distinct de-identified content. Source details and row-level outcomes remain in ignored private state.

- **review packages sources** (`inventory-review-packages-20261005`, content, medium)
  Verify source evidence, reconcile existing records, and draft distinct de-identified content. Source details and row-level outcomes remain in ignored private state.

- **de-identify publication commit metadata** (`privacy-publish-metadata-20261005`, privacy, high)
  Local publication metadata defaults are identifying. Verify an anonymous command-scoped author and committer before publishing this batch; preserve existing history and global configuration.

## published

- **draft a de-identified article from a registered source** (`source-59727238`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-c87328e0`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-8a0a8869`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-1eb2af4f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-3d6ae11d`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-dc0a8650`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-c627be20`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b60f8b29`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-0df1f5c8`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-c28e0f8f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-013a284a`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-369cc430`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b3fcc99a`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-79fffc37`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-29b15786`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-4097c6aa`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-ef249c61`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-fe4ef9b2`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-ba33ecf7`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-931607f2`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b91ac862`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-ed6ee9cf`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-107f9df8`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-e89831b4`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-84ee8815`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-dca55993`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-cd3bb106`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-c386a5c8`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-358a4b55`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-2b7a6fb1`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-8f12c8b6`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-11b897e4`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-2e553e31`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-ca3e45b9`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-7b27013d`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-50ecedbc`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-95370c95`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-aab93462`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b858f1b4`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-fb218057`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-0beddd3a`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-29807e66`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-d29bfe33`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-69e310b3`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-48787df8`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-bb19cf72`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-0de936fd`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-b65e288f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-cb5b554f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-de100426`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-93c667ce`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-57429d98`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-44494a3f`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-3fa8627c`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-d3ec1fe8`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.

- **draft a de-identified article from a registered source** (`source-424e47c3`, content, medium)
  A registered source to scan and turn into a de-identified build-log or article: what it set out to do, how it evolved, how long it ran, what works, what broke, any novel idea worth a diagram. The source identity is in gitignored garden/state/private; keep owner/repo names out of committed state until de-identified. Set status to published once an article ships.
