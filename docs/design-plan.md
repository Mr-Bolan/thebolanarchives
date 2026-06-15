# design-plan.md

Planning layer for `thebolanarchives`.

This document is the design source for the first implementation pass. It does not include framework code.

## framework decision

Use Next.js App Router with MDX and static export. This matches `codex.md`, keeps local MDX content simple, and leaves room for interactive explanation components later without adding a CMS or server runtime.

## visual direction

The strongest direction is **The Blackbox Garden**:

```text
anonymous archive + digital garden + machine field manual + interactive explanations
```

The site should feel like a dark technical archive where unfinished systems grow into explanations. It should read as a public record of private work, not as a portfolio, SaaS homepage, startup site, or generic developer blog.

Core visual traits:

- dark charcoal surfaces, warm text, thin technical borders
- record-label metadata treated as part of the visual identity
- dense archive lists mixed with calm long-form reading
- subdued accent colors that feel like terminal glow, indicator lights, field annotations, and warning labels
- subtle texture from grid, grain, or scanline treatments, never decoration that fights reading
- lowercase interface language wherever practical
- interaction used to explain systems, not to entertain

Non-goals:

- no oversized marketing hero
- no bright corporate palette
- no generic card wall
- no cute mascot energy
- no mystery so thick that navigation becomes unclear
- no ornamental animation without explanatory value

## information architecture

The site is a static archive with route-level collections. The homepage is an entrance, `/index` is the full archive, and content types map directly to folders.

Primary routes:

| route | purpose |
| --- | --- |
| `/` | sparse archive entrance with recent material and quiet identity statement |
| `/entries` | longer archive articles and essays |
| `/field-notes` | observations from real systems, machines, operators, work, data, and mistakes |
| `/build-logs` | records of tools, scripts, dashboards, agents, prototypes, and workflows being built |
| `/fragments` | short thoughts that may later become entries or patterns |
| `/patterns` | reusable mental models, frameworks, and named ways of seeing systems |
| `/experiments` | interactive explanations, simulations, visual models, and prototypes |
| `/graveyard` | retired, failed, abandoned, or replaced work |
| `/index` | full archive list with filters by type, status, confidence, year, topic, and tool |
| `/about` | anonymous explanation of what the archive is and how to read it |

Secondary archive relationships:

- every content page can link to related artefacts
- fragments can mature into entries or patterns without being hidden
- graveyard notes should point to replacements when they exist
- experiments can accompany entries, but must also be readable as standalone records

## route-by-route page purpose

### `/`

Purpose: establish identity and give immediate entry points.

Content:

- `thebolanarchives`
- `A private index of public experiments.`
- `Things built. Things broken. Things understood later.`
- short anonymous archive statement
- recent entries
- latest field notes
- active build logs
- small fragment strip
- unfinished or retired artefacts
- link to `/index`

Layout: sparse first viewport with one strong text block and one compact archive feed visible below the fold.

### `/entries`

Purpose: longer posts with room for narrative, evidence, and reflection.

Layout: collection index first, then individual entry routes. List rows should feel like archive records, not blog teasers.

### `/field-notes`

Purpose: preserve real-world observations and system behavior.

Layout: denser than entries. Emphasize origin, confidence, tools, and date.

### `/build-logs`

Purpose: show work in progress without pretending it is final.

Layout: timeline-friendly list with status badges, "what changed", and "what broke" summaries.

### `/fragments`

Purpose: publish rough thoughts quickly.

Layout: short, text-first records with compact metadata. No pressure to look like essays.

### `/patterns`

Purpose: collect reusable mental models.

Layout: pattern index with short definitions and links to entries that use each pattern.

### `/experiments`

Purpose: house interactive explanations and demos.

Layout: list experiments like instruments. Each experiment page needs an explanation, controls, state readout, and static fallback.

### `/graveyard`

Purpose: make abandoned work part of the archive's honesty.

Layout: muted archive records with reasons retired, replacement links, and lessons kept.

### `/index`

Purpose: complete archive inventory.

Layout: table-like list with filters. It should be fast to scan by type, status, confidence, tool, year, and tag.

### `/about`

Purpose: explain the archive without revealing personal identity.

Layout: plain text, no personal brand treatment. Include "what this is", "what this is not", "why anonymous", and "how labels work".

## layout system

Breakpoints:

| token | width | use |
| --- | ---: | --- |
| `bp-sm` | `375px` | small phone verification |
| `bp-md` | `768px` | tablet and large phone landscape |
| `bp-lg` | `1024px` | side rail starts becoming useful |
| `bp-xl` | `1440px` | full archive layout with generous margins |

Spacing scale:

```text
4, 8, 12, 16, 24, 32, 48, 64, 96
```

Core layout rules:

- mobile first
- no horizontal scroll
- body text measure: 35-60 characters on mobile, 60-75 on desktop
- default page gutter: `16px` mobile, `24px` tablet, `32px` desktop
- reading column max width: about `72ch`
- wide archive layout max width: about `1180px`
- desktop article layout: left nav or section marker, centered article, right rail for table of contents and notes
- no cards inside cards
- archive cards may be used for repeated records, but page sections should remain unframed
- sticky elements must never cover focused content or anchor targets

Page structure:

```text
SiteShell
  Header
  Nav
  main
    route content
  Footer
```

Article structure:

```text
record header
archive metadata
body
side notes / toc on wide screens
related artefacts
open questions
```

## typography system

Use system fonts first. No external font dependency is required for the first implementation.

Roles:

| role | stack | behavior |
| --- | --- | --- |
| body | `ui-serif, Georgia, Cambria, "Times New Roman", serif` | readable, calm, long-form |
| interface | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | navigation and compact labels |
| metadata | `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace` | archive labels, code, record ids |

Type scale:

| token | size | use |
| --- | ---: | --- |
| `text-xs` | `0.75rem` | metadata, badges |
| `text-sm` | `0.875rem` | nav, compact summaries |
| `text-base` | `1rem` | body |
| `text-md` | `1.125rem` | lead body |
| `text-lg` | `1.375rem` | section headings |
| `text-xl` | `1.75rem` | page headings |
| `text-display` | `2.5rem` to `3.25rem` | homepage title only |

Rules:

- body line height: `1.65`
- compact metadata line height: `1.35`
- headings lowercase where natural
- no negative letter spacing
- use tabular numbers for dates, ids, and archive rows
- do not use hero-scale type inside cards or compact panels

## color token system

Base tokens from the chosen brief:

```css
--bg: #101211;
--bg-soft: #151817;
--panel: #1b1f1d;
--text: #e8e3d7;
--text-muted: #9b9f98;
--text-faint: #6f756d;
--accent-amber: #d6a84f;
--accent-green: #7f9f7a;
--accent-cyan: #7ba7a6;
--accent-red: #b97066;
--border: #2a302d;
--border-soft: #202522;
```

Semantic aliases:

| token | value | use |
| --- | --- | --- |
| `--surface-page` | `var(--bg)` | page background |
| `--surface-raised` | `var(--bg-soft)` | header, subtle panels |
| `--surface-record` | `var(--panel)` | archive cards and metadata blocks |
| `--text-primary` | `var(--text)` | main text |
| `--text-secondary` | `var(--text-muted)` | summaries |
| `--text-tertiary` | `var(--text-faint)` | quiet labels |
| `--line-primary` | `var(--border)` | visible dividers |
| `--line-soft` | `var(--border-soft)` | hairlines |
| `--focus-ring` | `var(--accent-cyan)` | keyboard focus |
| `--link` | `var(--accent-cyan)` | inline links |
| `--warning` | `var(--accent-amber)` | caution, uncertain records |
| `--success` | `var(--accent-green)` | field tested or confirmed |
| `--danger` | `var(--accent-red)` | retired, broken, failed |

Status colors:

| status | accent |
| --- | --- |
| `fragment` | `--text-faint` |
| `sketch` | `--accent-cyan` |
| `working_note` | `--accent-amber` |
| `field_tested` | `--accent-green` |
| `stable_artefact` | `--text-primary` |
| `retired` | `--accent-red` |

Rules:

- text contrast must meet WCAG AA at minimum
- color cannot be the only status indicator
- accents should be sparse
- pure white is reserved for rare high-contrast focus or system states
- do not introduce a large blue/purple SaaS gradient palette

## texture/background system

Allowed textures:

- faint grid at very low opacity
- faint paper grain or noise
- sparse blueprint or register lines
- subtle scanline treatment on record labels only

Rules:

- textures must sit behind text and never reduce readability
- no gradient orbs, bokeh blobs, or decorative glows as page background
- use one global background treatment first
- per-section texture changes are skipped until a real need appears

## interaction and animation principles

Interaction should make the archive easier to understand.

Use interactions for:

- filtering `/index`
- expanding compact metadata
- copying links to headings
- table-of-contents highlighting
- experiment controls such as sliders, toggles, and stepped inputs
- revealing notes, definitions, and assumptions

Avoid interactions for:

- decorative motion
- marketing-style reveal sections
- hover-only meaning
- hidden navigation

Motion rules:

- duration: `150ms` to `300ms`
- animate opacity and transform only
- respect `prefers-reduced-motion`
- keep focus visible during transitions
- no animation should block reading or input
- static fallback must exist for future interactive explanations

## accessibility notes

Required from the first build:

- skip link to main content
- semantic headings with one `h1` per page
- keyboard-visible focus states
- touch targets at least `44px` high where controls exist
- labels for filters and form controls
- no color-only status communication
- readable contrast for all text and badges
- reduced-motion support
- table/list views that remain understandable to screen readers
- anchor targets offset below sticky header
- code blocks and terminal blocks must not trap keyboard focus
- interactive experiments must expose current state as text, not only visuals

## static export constraints

The site targets Next.js App Router with MDX and `output: 'export'` on GitHub Pages using a user or custom domain.

Constraints:

- no server-only runtime behavior
- no API routes required for the first build
- no authenticated state
- no CMS dependency
- no runtime database
- no dynamic image optimizer dependency unless configured for static export
- all content routes must be generated from local MDX files
- filters can be client-side over prebuilt content metadata
- search, if added later, should use a static JSON index
- every interactive demo must degrade to readable static content
- no `basePath` is needed for the planned custom domain

## first implementation task list

1. Scaffold the Next.js App Router project with MDX and static export.
2. Add global style files: `tokens.css`, `global.css`, `typography.css`, `archive.css`.
3. Implement content loading and frontmatter validation from local MDX.
4. Create one sample entry and one sample fragment using the content model.
5. Build `SiteShell`, `Header`, `Nav`, and `Footer`.
6. Build archive metadata primitives: `ArchiveMetaCard`, badges, tags, and `ArchiveCard`.
7. Build the homepage with sparse identity text and recent archive sections.
8. Build collection routes and slug routes for each content type.
9. Build `/index` as a static metadata list with filters.
10. Add writing components: code, terminal, diagram, table of contents, side notes, and open questions.
11. Add `ExperimentFrame` with a static fallback slot before building custom experiments.
12. Add GitHub Pages deploy workflow and `public/CNAME`.

Skipped for now: visual graph, site search, design history route, and custom experiment modules. Add them when there is enough content to justify them.
