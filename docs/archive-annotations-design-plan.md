# Archive Annotations — Design Plan

Feature concept for `thebolanarchives`.

This document defines the design direction for a future article annotation/comment system. It is intentionally not a technical implementation plan. The technical plan should be produced by an agent that can inspect the current repository.

## 1. Purpose

Standard comment sections do not fit `thebolanarchives`.

The archive should feel like a discovered technical record, not a social feed. Reader feedback should behave like **annotations left on the archive itself**: small pinned notes, margin marks, post-it slips, evidence tabs, and field comments attached to specific parts of a record.

The feature name should be:

**Archive Annotations**

The core idea:

> readers leave traces on specific parts of the archive, and those traces can be lifted, read, collapsed, and revisited without breaking the article.

## 2. Design Principles

### 2.1 Keep the article primary

Annotations are secondary. They should never make the writing feel unreadable.

Default state:
- article is clean and readable
- annotation markers are visible but quiet
- notes are collapsed unless opened
- a reader can hide annotation markers entirely

### 2.2 Make feedback contextual

A note should attach to a specific paragraph, heading, or selected excerpt.

Start with paragraph-level anchoring. Exact text selection can come later.

Paragraph anchoring is:
- easier to implement
- more stable when articles are edited
- easier to moderate
- more usable on mobile

### 2.3 Preserve the Blackbox Garden

The feature should feel like:
- archive marginalia
- field annotations
- pinned evidence
- post-it tabs
- notes left in a machine manual

It should not feel like:
- a Disqus comment section
- social media replies
- live chat
- bright SaaS feedback widgets
- gamified reactions

### 2.4 Layer, do not interrupt

Annotations should create a visual layer over or beside the article.

The reader should be able to move between:
- reading mode
- annotation mode
- add-note mode

Each mode should be clear.

## 3. User Experience Model

## 3.1 Reading Mode

Default mode.

What the reader sees:
- article content
- quiet annotation markers beside annotated paragraphs
- optional annotation count near headings or paragraphs
- toggle: `show annotations` / `hide annotations`

What the reader does:
- read normally
- click a marker to open a note
- toggle annotation layer if desired

## 3.2 Annotation Mode

Activated when the reader clicks `show annotations`.

What changes:
- annotation markers become more visible
- annotated paragraphs receive a faint edge highlight
- margin notes or post-it cards become available
- a soft archive-light effect may reveal the annotation layer

What should not change:
- article text remains fully readable
- layout should not jump aggressively
- keyboard navigation still works

## 3.3 Add-Note Mode

Activated by a button such as:

`leave a note`

Reader flow:
1. click `leave a note`
2. select a paragraph or click a paragraph anchor
3. note composer opens
4. reader enters pseudonym or chooses anonymous
5. reader writes note
6. submit places note into pending/moderated state

First version can be prototype-only or read-only. The design should allow a future backend.

## 4. Annotation Object

A note should visually communicate:

- anchor location
- note body
- optional author/pseudonym
- timestamp
- status: pending, approved, hidden, archived
- optional replies later
- optional excerpt from the paragraph

Recommended display labels:
- `reader note`
- `field comment`
- `annotation`
- `pending review`
- `archived`

Avoid:
- likes
- scores
- badges
- profile cards
- engagement metrics

## 5. Visual System

## 5.1 Closed Marker

Small marker beside annotated text.

Possible shapes:
- folded-corner tab
- small square note chip
- numbered archive pin
- tiny amber/green paper tab

Design:
- muted border
- monospace count, e.g. `note 02`
- not color-only
- touch target large enough on mobile

## 5.2 Open Note

When opened, the note should feel like it is being lifted from the page.

Visual traits:
- warm muted paper tone, not bright yellow
- thin border
- slight shadow
- subtle rotated or offset layer only if it does not harm reading
- monospace metadata strip
- readable body font
- close/collapse control

Example labels:

```text
reader_note_004
anchor: paragraph 12
status: approved
```

## 5.3 Note Stack

Multiple notes on one paragraph should stack.

Closed state:
- one marker with count, e.g. `3 notes`

Open state:
- cards appear as a small stack
- reader can cycle through notes
- mobile uses an inline list, not overlapping cards

## 5.4 Margin Rail

Desktop preferred layout:
- article remains centered
- annotation markers sit near paragraph edges
- open notes appear in right margin where space allows
- faint connector line links note to paragraph

Mobile preferred layout:
- markers appear inline after paragraph
- opened notes expand below the paragraph
- no floating overlays that cover text

## 6. Flashlight / Archive-Light Effect

The cursor can behave like a soft archive lamp, not a literal survival-horror flashlight.

Purpose:
- reveal the annotation layer
- add atmosphere
- guide attention to markers and pinned notes

Rules:
- text must always remain readable without the light
- the light should be subtle and low opacity
- it should never be required to use the site
- it must respect `prefers-reduced-motion`
- it should be disableable or absent on touch/mobile
- do not make the page dark except under the cursor
- avoid heavy GPU effects

Recommended treatment:
- soft radial glow following cursor
- slightly brightens borders, note markers, paper grain, and annotation connectors
- only active on article pages or when annotation mode is on
- markers can glow gently when the cursor passes nearby

Name ideas:
- `archive lamp`
- `inspection light`
- `reader light`

Best label for the feature:
`archive lamp`

## 7. Accessibility Requirements

Required:
- annotations usable by keyboard
- markers are buttons with accessible labels
- open notes are reachable in reading order
- no hover-only interaction
- color is not the only meaning
- note counts are text
- Escape closes an open note when appropriate
- reduced motion disables cursor-follow effects
- touch devices do not require hover
- screen readers can access note content near its anchor
- focus is not trapped unless using a true modal

Do not build an inaccessible overlay just because it looks good.

## 8. Privacy and Moderation

This is a public site and the repository is public.

Do not store private notes in Git.

A live public comment system will need:
- spam protection
- moderation state
- deletion/hide mechanism
- abuse handling
- rate limiting or auth strategy
- clear terms for anonymous notes

Preferred initial strategy:
1. build visual prototype with local/static sample annotations
2. produce technical plan for storage and moderation
3. only then connect a backend

## 9. Suggested Phases

### Phase A — Design Prototype

Build UI only.

Includes:
- annotation markers
- opened note cards
- note stack behavior
- desktop margin layout
- mobile inline layout
- annotation toggle
- archive lamp visual effect
- hardcoded sample notes

No live storage. No public submissions.

### Phase B — Static Annotation Data

Use local static JSON or MDX frontmatter/sample data.

Includes:
- per-article annotation data
- paragraph IDs
- read-only notes
- no user submission yet

### Phase C — Submission Prototype

Add a note composer.

Can store to a mock adapter only.

Includes:
- composer UI
- pending state
- validation
- no production persistence unless backend chosen

### Phase D — Backend Plan

Choose storage:
- GitHub Discussions/Issues
- Supabase
- Firebase
- Appwrite
- custom lightweight API

For a static GitHub Pages site, live comments require an external backend or GitHub-based integration.

### Phase E — Moderated Live Annotations

Production-ready version.

Includes:
- moderation queue
- spam controls
- public rendering
- admin hide/delete
- export/archive option

## 10. Anti-Goals

Do not:
- replace the article with a social feed
- add engagement metrics
- add user profiles
- add full social networking features
- make the flashlight necessary for reading
- make comments visually louder than the writing
- store comments in committed source files
- require a database before the visual idea is proven

## 11. Acceptance Criteria for First Prototype

A successful first prototype should prove:

- annotations feel native to the archive
- article remains readable
- markers can be opened/closed
- desktop and mobile both work
- visual treatment feels like field notes/post-it archive slips
- archive lamp is subtle, optional, and not annoying
- no backend or moderation risk is introduced yet
- no route/content model/deploy changes are made unnecessarily

## 12. Technical Planning Questions for Codex

Codex should inspect the repo and answer:

1. Where should annotation UI components live?
2. How are article paragraphs currently rendered?
3. Can paragraph anchors be generated safely from MDX?
4. Should sample annotations live in JSON, MDX frontmatter, or a content-sidecar file?
5. What client components are required?
6. How does this interact with static export and GitHub Pages basePath?
7. How can the feature degrade without JavaScript?
8. What backend options fit a static GitHub Pages site later?
9. What is the smallest safe Phase A implementation?
10. What files would be touched?
11. What tests/checks should run?
12. What must not be changed?

---
