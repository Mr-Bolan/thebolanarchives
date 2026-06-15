# codex.md — thebolanarchives map

Read this first. It says where everything is and what it does, so anything (human or agent)
can route without re-reading the whole brief.

> Things built. Things broken. Things understood later.

**Identity:** an anonymous archive + digital garden + machine field manual + interactive
explanations. A dark technical archive where unfinished systems grow into explanations.
Theme: **The Blackbox Garden**. Full brief: [docs/thebolanarchives_website_theme_brief_chosen.md](docs/thebolanarchives_website_theme_brief_chosen.md).

---

## Tech & deploy decisions

- **Framework:** Next.js (App Router) with MDX content.
- **Export:** static export (`output: 'export'`) — fully static site.
- **Host:** GitHub Pages project site at `/thebolanarchives`. Production builds use
  `basePath`/`assetPrefix`; local development stays at `/`. Add `public/CNAME` only
  after the real domain is known.
- **Content:** MDX files with frontmatter (schema in `docs/content-model.md`).

## Current build status

**Static archive scaffolded.** Next.js App Router, MDX content loading, archive routes,
content audit, generated public index, authoring workflow, and GitHub Pages deploy support
exist. No `public/CNAME` is committed until a real custom domain is known.

---

## Directory map

```text
thebolanarchives/
  codex.md            <- this file: master routing map
  docs/               <- briefs + design docs
    content-authoring.md <- how to draft, audit, and promote archive writing
  content/            <- all writing (MDX), one subfolder per content type
    entries/          entry        -> /entries
    field-notes/      field_note   -> /field-notes
    build-logs/       build_log    -> /build-logs
    fragments/        fragment     -> /fragments
    patterns/         pattern      -> /patterns
    experiments/      experiment   -> /experiments
    graveyard/        graveyard_note -> /graveyard
    inbox/            raw notes ignored by loader/audit until promoted
  templates/
    content/          copyable MDX templates for each content type
  src/
    app/              <- Next.js App Router routes
    components/
      layout/         SiteShell, Header, Footer
      navigation/     Nav
      archive/        ArchiveCard, ArchiveMetaCard, StatusBadge, ConfidenceBadge, TagList, RelatedArtifacts, ArchiveIndex
      writing/        CodeBlock, TerminalBlock, DiagramBlock, SideNote, TableOfContents, OpenQuestions
      experiments/    ExperimentFrame + future interactive modules
    styles/           tokens.css, global.css, typography.css, archive.css
    lib/              content.ts, headings.ts, page-metadata.ts
  public/
    images/  diagrams/  textures/   <- static assets (+ future CNAME when real domain is known)
```

Every folder has its own `README.md` with details. The conceptual structure mirrors brief
section 28, adapted for Next.js (`src/app/` added for App Router).

---

## Where do I put X? (content type -> folder)

| content type | folder | route |
| --- | --- | --- |
| `entry` | `content/entries/` | `/entries` |
| `field_note` | `content/field-notes/` | `/field-notes` |
| `build_log` | `content/build-logs/` | `/build-logs` |
| `fragment` | `content/fragments/` | `/fragments` |
| `pattern` | `content/patterns/` | `/patterns` |
| `experiment` | `content/experiments/` | `/experiments` |
| `graveyard_note` | `content/graveyard/` | `/graveyard` |

Each post is `slug.mdx` with frontmatter (title, slug, type, status, confidence, summary,
created, updated, tags, tools, narrative_origin, visibility, related). `README.md` files in
content folders are ignored by the loader.

**Maturity statuses:** `fragment`, `sketch`, `working_note`, `field_tested`, `stable_artefact`, `retired`.
**Confidence levels:** `low`, `partial`, `medium`, `high`, `field_confirmed`.

---

## Route table (route -> file)

| route | purpose | file |
| --- | --- | --- |
| `/` | sparse archive homepage | `src/app/page.tsx` |
| `/entries` | longer posts | `src/app/entries/page.tsx` (+ `[slug]`) |
| `/field-notes` | real-system observations | `src/app/field-notes/page.tsx` (+ `[slug]`) |
| `/build-logs` | things being built | `src/app/build-logs/page.tsx` (+ `[slug]`) |
| `/fragments` | short thoughts | `src/app/fragments/page.tsx` (+ `[slug]`) |
| `/patterns` | mental models | `src/app/patterns/page.tsx` (+ `[slug]`) |
| `/experiments` | interactive demos | `src/app/experiments/page.tsx` (+ `[slug]`) |
| `/graveyard` | abandoned work | `src/app/graveyard/page.tsx` (+ `[slug]`) |
| `/index` | filterable full archive | `src/app/index/page.tsx` |
| `/about` | anonymous explanation | `src/app/about/page.tsx` |

---

## Component index (component -> folder)

| component | folder | role |
| --- | --- | --- |
| `SiteShell`, `Header`, `Footer` | `src/components/layout/` | global shell |
| `Nav` | `src/components/navigation/` | section navigation |
| `ArchiveMetaCard` | `src/components/archive/` | metadata block on content pages |
| `ArchiveCard` | `src/components/archive/` | list/homepage record card |
| `StatusBadge`, `ConfidenceBadge`, `TagList` | `src/components/archive/` | metadata labels |
| `RelatedArtifacts` | `src/components/archive/` | linked posts |
| `ArchiveIndex` | `src/components/archive/` | filterable list (powers `/index`) |
| `CodeBlock`, `TerminalBlock`, `DiagramBlock` | `src/components/writing/` | content blocks |
| `SideNote`/`FootnoteRail`, `TableOfContents`, `OpenQuestions` | `src/components/writing/` | reading aids |
| `ExperimentFrame` | `src/components/experiments/` | interactive wrapper |

---

## Design quick reference

Tokens (full list in brief section 17, implemented later in `src/styles/tokens.css`):

```css
--bg: #101211;  --bg-soft: #151817;  --panel: #1b1f1d;
--text: #e8e3d7;  --text-muted: #9b9f98;  --text-faint: #6f756d;
--accent-amber: #d6a84f;  --accent-green: #7f9f7a;  --accent-cyan: #7ba7a6;  --accent-red: #b97066;
--border: #2a302d;  --border-soft: #202522;
```

Typography: body = readable serif/humanist sans; metadata/headings = monospace, lowercase
preferred. Non-negotiables: brief section 30.

---

## Remaining phase

1. Add `public/CNAME` only after the real custom domain is known and verified in GitHub Pages.
2. If the site later moves to a root custom domain, revisit the production `basePath`.
