# component-map.md

Component contract for `thebolanarchives`.

This document defines what to build later. It does not create framework code.

## shared conventions

Build priority:

| priority | meaning |
| --- | --- |
| `P0` | required for the first usable archive |
| `P1` | required for strong reading and browsing |
| `P2` | useful after core content exists |
| `Later` | planned extension, skip until content needs it |

Shared content shape used by archive components:

```text
ArchiveItem:
  title
  slug
  type
  status
  confidence
  summary
  created
  updated
  tags
  tools
  narrative_origin
  visibility
  related
  record_id?
```

## layout components

### `SiteShell`

- purpose: global page wrapper for background, skip link, header, nav, main, and footer.
- file path: `src/components/layout/SiteShell.tsx`
- props/interface: `children`, optional `className`.
- visual behavior: dark page surface, subtle global texture, constrained main width by route.
- accessibility: includes skip link, semantic `main`, and stable focus target.
- build priority: `P0`
- dependencies: `Header`, `Nav`, `Footer`.
- acceptance criteria: every route can render inside it without horizontal scroll or hidden focused content.

### `Header`

- purpose: show archive identity and quiet status line.
- file path: `src/components/layout/Header.tsx`
- props/interface: optional `statusLine`.
- visual behavior: compact, mostly text, lowercase `thebolanarchives`; no hero treatment.
- accessibility: site name links to `/`; current focus is visible.
- build priority: `P0`
- dependencies: none.
- acceptance criteria: readable at 375px, does not wrap awkwardly, and never dominates page content.

### `Footer`

- purpose: close pages with archive tone and utility links.
- file path: `src/components/layout/Footer.tsx`
- props/interface: optional `links`.
- visual behavior: muted border-top, small metadata-like text.
- accessibility: semantic `footer`; links have descriptive labels.
- build priority: `P0`
- dependencies: none.
- acceptance criteria: contains no personal identity leak and remains quiet on all routes.

### `Nav`

- purpose: primary route navigation.
- file path: `src/components/navigation/Nav.tsx`
- props/interface: `items`, optional `currentPath`.
- visual behavior: compact text links, active state by underline/border and text, not color alone.
- accessibility: semantic `nav` with label; keyboard reachable; current page announced.
- build priority: `P0`
- dependencies: route table.
- acceptance criteria: all primary routes are reachable on mobile and desktop without hidden menus for the first build.

## archive components

### `ArchiveMetaCard`

- purpose: record-label metadata at the top of content pages.
- file path: `src/components/archive/ArchiveMetaCard.tsx`
- props/interface: `item`, optional `compact`.
- visual behavior: panel with monospace labels, type, status, confidence, origin, dates, tools, and tags.
- accessibility: structured definition list; color labels include text.
- build priority: `P0`
- dependencies: `StatusBadge`, `ConfidenceBadge`, `TagList`.
- acceptance criteria: works in full and compact modes, and still makes sense with empty `tools` or `related`.

### `ArchiveCard`

- purpose: repeated record preview for homepage and collection pages.
- file path: `src/components/archive/ArchiveCard.tsx`
- props/interface: `item`, optional `variant: "default" | "compact" | "row"`.
- visual behavior: record-like item with title, summary, date, status, confidence, and tags; not a marketing card.
- accessibility: whole card is not the only link unless nested links are avoided; title link has clear text.
- build priority: `P0`
- dependencies: `StatusBadge`, `ConfidenceBadge`, `TagList`.
- acceptance criteria: supports dense archive rows and readable summaries without layout shift.

### `StatusBadge`

- purpose: show maturity status.
- file path: `src/components/archive/StatusBadge.tsx`
- props/interface: `status`.
- visual behavior: small monospace label; distinct shape/text for each status.
- accessibility: label includes readable status text; color is not the only meaning.
- build priority: `P0`
- dependencies: status enum.
- acceptance criteria: all six statuses render with sufficient contrast.

### `ConfidenceBadge`

- purpose: show claim confidence.
- file path: `src/components/archive/ConfidenceBadge.tsx`
- props/interface: `confidence`.
- visual behavior: small technical label, visually quieter than status.
- accessibility: readable text for all confidence levels.
- build priority: `P0`
- dependencies: confidence enum.
- acceptance criteria: `field_confirmed` fits on mobile without overflowing.

### `TagList`

- purpose: render tags and tools consistently.
- file path: `src/components/archive/TagList.tsx`
- props/interface: `items`, optional `label`, optional `limit`.
- visual behavior: compact wrapped tokens with low contrast borders.
- accessibility: list semantics; optional label available to screen readers.
- build priority: `P0`
- dependencies: none.
- acceptance criteria: long tags wrap cleanly and empty arrays render nothing.

### `RelatedArtifacts`

- purpose: show linked records at the end of content pages.
- file path: `src/components/archive/RelatedArtifacts.tsx`
- props/interface: `items`, optional `heading`.
- visual behavior: compact archive links, grouped by type when useful.
- accessibility: semantic section with heading; links include title and type.
- build priority: `P1`
- dependencies: content lookup, `ArchiveCard` compact variant.
- acceptance criteria: empty related list does not render a dead section.

### `ArchiveIndex`

- purpose: full archive inventory with filters.
- file path: `src/components/archive/ArchiveIndex.tsx`
- props/interface: `items`, optional `initialFilters`.
- visual behavior: dense table-like list with filter controls above it.
- accessibility: labeled controls, keyboard usable filters, visible result count, no hover-only actions.
- build priority: `P1`
- dependencies: `ArchiveCard` row variant, filter helpers.
- acceptance criteria: filters by type, status, confidence, year, tag, and tool using static metadata.

## writing components

### `CodeBlock`

- purpose: styled code snippets in MDX.
- file path: `src/components/writing/CodeBlock.tsx`
- props/interface: `children`, optional `language`, optional `filename`.
- visual behavior: dark inset block with filename/language label.
- accessibility: code remains selectable; horizontal overflow is contained.
- build priority: `P1`
- dependencies: syntax highlighting decision later.
- acceptance criteria: long lines scroll inside the block without creating page-level horizontal scroll.

### `TerminalBlock`

- purpose: render command output and logs.
- file path: `src/components/writing/TerminalBlock.tsx`
- props/interface: `children`, optional `title`, optional `prompt`.
- visual behavior: machine-log styling, muted prompt, no fake window chrome unless useful.
- accessibility: text is real text, not image; labels identify command vs output.
- build priority: `P1`
- dependencies: none.
- acceptance criteria: supports copyable multiline output and preserves spacing.

### `DiagramBlock`

- purpose: frame diagrams, images, static SVGs, and future visual explanation panels.
- file path: `src/components/writing/DiagramBlock.tsx`
- props/interface: `children`, optional `caption`, optional `alt`, optional `size`.
- visual behavior: restrained figure container with caption and low-contrast border.
- accessibility: meaningful diagrams require alt text or adjacent explanation.
- build priority: `P1`
- dependencies: none.
- acceptance criteria: image dimensions are reserved to prevent layout shift.

### `SideNote`

- purpose: inline note, definition, warning, or field annotation.
- file path: `src/components/writing/SideNote.tsx`
- props/interface: `children`, optional `kind: "note" | "warning" | "definition" | "evidence"`.
- visual behavior: inline on mobile, side rail on wide article layouts when space allows.
- accessibility: appears in reading order near its anchor.
- build priority: `P1`
- dependencies: article layout.
- acceptance criteria: note content is readable without relying on desktop side placement.

### `FootnoteRail`

- purpose: collect article side notes into a stable desktop rail when the viewport is wide enough.
- file path: `src/components/writing/FootnoteRail.tsx`
- props/interface: `notes`, optional `activeId`.
- visual behavior: quiet right-side note column aligned with article sections; collapses back into inline notes on small screens.
- accessibility: notes remain in document reading order through their `SideNote` anchors; the rail is supplemental.
- build priority: `P2`
- dependencies: `SideNote`, article heading or note extraction.
- acceptance criteria: hiding the rail must not remove any note content from mobile or screen reader users.

### `TableOfContents`

- purpose: help navigate long entries.
- file path: `src/components/writing/TableOfContents.tsx`
- props/interface: `headings`, optional `activeId`.
- visual behavior: sticky right rail on desktop, compact collapsible section on mobile.
- accessibility: nav label; links target real headings; active state not color-only.
- build priority: `P1`
- dependencies: heading extraction.
- acceptance criteria: keyboard users can tab through links and anchors land below sticky header.

### `OpenQuestions`

- purpose: display unresolved questions as first-class archive material.
- file path: `src/components/writing/OpenQuestions.tsx`
- props/interface: `questions`.
- visual behavior: muted list with question marker and archive-label tone.
- accessibility: semantic list, text visible without icons.
- build priority: `P1`
- dependencies: none.
- acceptance criteria: zero questions render nothing; one question does not look broken.

## experiment components

### `ExperimentFrame`

- purpose: wrapper for interactive explanations and static fallbacks.
- file path: `src/components/experiments/ExperimentFrame.tsx`
- props/interface: `title?`, `children?`, `fallback`, optional `controlsLabel`.
- visual behavior: full-width explanation instrument, not a decorative card.
- accessibility: static fallback is always visible or reachable; controls are labeled.
- build priority: `P1`
- dependencies: none for first pass.
- acceptance criteria: an experiment page remains understandable with JavaScript disabled.

### `LayerSlider`

- purpose: explain Layer 0 to Layer 4 thinking.
- file path: `src/components/experiments/LayerSlider.tsx`
- props/interface: `layers`, optional `initialLayer`.
- visual behavior: stepped control with changing explanation and evidence state.
- accessibility: native range or segmented controls with text state output.
- build priority: `Later`
- dependencies: `ExperimentFrame`.
- acceptance criteria: each layer has a readable static equivalent.

### `DashboardTruthMeter`

- purpose: show distance between data existing and data supporting action.
- file path: `src/components/experiments/DashboardTruthMeter.tsx`
- props/interface: `stages`, optional `initialStage`.
- visual behavior: meter or staged ladder with labels, not a speedometer gimmick.
- accessibility: stage text and explanation are exposed outside the visual.
- build priority: `Later`
- dependencies: `ExperimentFrame`.
- acceptance criteria: users can change stages by keyboard and understand the current claim.

### `MachineStateTimeline`

- purpose: show simplified machine run states over time.
- file path: `src/components/experiments/MachineStateTimeline.tsx`
- props/interface: `events`, optional `scale`.
- visual behavior: timeline of RUN, IDLE, DOWN, recycle, target shortfall, and similar states.
- accessibility: events also render as an ordered list or table.
- build priority: `Later`
- dependencies: `ExperimentFrame`.
- acceptance criteria: color is not the only state cue and dense timelines remain readable.

### `AssumptionToggle`

- purpose: let readers change assumptions and see conclusions update.
- file path: `src/components/experiments/AssumptionToggle.tsx`
- props/interface: `assumptions`, `result`.
- visual behavior: simple toggles, sliders, or steppers with immediate text result.
- accessibility: native controls, labels, and live region for result changes.
- build priority: `Later`
- dependencies: `ExperimentFrame`.
- acceptance criteria: changed assumptions are reflected in text, not only in a chart.

### `ArchiveGraph`

- purpose: visual map of connected entries and concepts.
- file path: `src/components/experiments/ArchiveGraph.tsx`
- props/interface: `nodes`, `edges`, optional `selectedSlug`.
- visual behavior: quiet graph, more field map than social network.
- accessibility: graph has list fallback grouped by node type.
- build priority: `Later`
- dependencies: content relationship data.
- acceptance criteria: graph does not replace normal navigation and remains optional.

### `BuildStatusPanel`

- purpose: show whether a project is active, paused, abandoned, retired, or merged.
- file path: `src/components/experiments/BuildStatusPanel.tsx`
- props/interface: `status`, optional `since`, optional `next`, optional `replacementSlug`.
- visual behavior: compact technical status panel.
- accessibility: status appears as text and does not depend on color.
- build priority: `P2`
- dependencies: status vocabulary.
- acceptance criteria: works for build logs and graveyard notes without custom page logic.

## build order

1. `SiteShell`, `Header`, `Nav`, `Footer`
2. `StatusBadge`, `ConfidenceBadge`, `TagList`
3. `ArchiveMetaCard`, `ArchiveCard`
4. `RelatedArtifacts`, `OpenQuestions`
5. `CodeBlock`, `TerminalBlock`, `DiagramBlock`
6. `TableOfContents`, `SideNote`, `FootnoteRail`
7. `ArchiveIndex`
8. `ExperimentFrame`
9. `BuildStatusPanel`
10. Future interactive modules only after matching content exists

Skipped for now: custom graph engine, animation framework, command palette, and full-text search. Add them when the archive has enough material to need them.
