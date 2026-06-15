# Archive Annotations - Technical Plan

Technical plan for the future Archive Annotations feature.

This document records the implementation shape before any feature code is built. It is
not approval to add a backend, public submission storage, route changes, CMS, database,
or search.

## Current repo constraints

- The site uses Next.js App Router with MDX content.
- The site is exported statically with `output: "export"`.
- Production deploys to GitHub Pages under `/thebolanarchives` with `basePath` and
  `assetPrefix`.
- Local development stays at `/`.
- The first implementation must not use API routes, server actions, runtime
  persistence, a CMS, a database, or authenticated state.
- Likely integration points are `src/components/archive/ContentDetailPage.tsx` and
  `src/components/writing/MdxRenderer.tsx`.
- Annotation work must preserve the Blackbox Garden tone: quiet archive marginalia, not
  a social feed.

## Recommended files

Future implementation should keep the feature contained:

```text
src/components/annotations/
  ArchiveAnnotations.tsx
  AnnotationAnchor.tsx
  AnnotationMarker.tsx
  AnnotationNote.tsx
src/lib/annotations.ts
```

Roles:

- `ArchiveAnnotations.tsx` - small client island for visibility toggle, open/collapse
  state, note stack state, and optional archive-lamp enhancement.
- `AnnotationAnchor.tsx` - server-safe wrapper around annotated paragraphs/headings.
- `AnnotationMarker.tsx` - marker button with count text and accessible labels.
- `AnnotationNote.tsx` - readable note card/list item for a single annotation.
- `src/lib/annotations.ts` - static sample data and lookup helpers for the prototype.

Do not create these files until implementation is approved.

## Anchoring model

Start with deterministic paragraph and heading anchors:

- `p` anchors: `p-1`, `p-2`, `p-3`, counted within the rendered article body.
- `h2` and `h3` anchors: reuse existing heading IDs from `slugifyHeading`.
- `h4` anchors can be supported if the wrapper cost stays small.

Lookup should use:

```ts
{
  recordSlug: string;
  anchorId: string;
}
```

This avoids route changes and keeps annotation data independent from list order. It also
keeps Phase A simple enough to verify. Exact text selection, durable text-position
matching, and edit migration can wait.

## Static sample data shape

Use static, sanitized sample data only:

```ts
export type ArchiveAnnotation = {
  id: string;
  recordSlug: string;
  anchorId: string;
  label: "reader note" | "field comment" | "annotation";
  body: string;
  author: "anonymous reader" | string;
  created: string;
  status: "approved" | "archived";
  excerpt?: string;
};
```

Example:

```ts
{
  id: "reader_note_001",
  recordSlug: "why-this-exists",
  anchorId: "p-2",
  label: "reader note",
  body: "This is a static prototype note, not a stored public submission.",
  author: "anonymous reader",
  created: "2026-06-15",
  status: "approved",
  excerpt: "Because useful work keeps disappearing into memory..."
}
```

Do not commit real user notes, private notes, personal data, private URLs, moderation
queues, credentials, or production submissions.

## Desktop layout

- Keep the article reading column primary and stable.
- Mark annotated paragraphs/headings with a quiet marker near the text edge.
- Use one marker per anchor; show count text for multiple notes.
- Open notes in a right margin rail when the viewport is wide enough.
- Use a faint connector only if it does not reduce readability.
- Stack multiple notes on one anchor as a compact list or layered cards.
- Do not let opened notes resize the article text column aggressively.

## Mobile layout

- Render markers inline after the paragraph or heading.
- Open notes below their anchor in normal document flow.
- Use full-width, readable note cards instead of overlapping stacks.
- Keep touch targets at least `44px` tall.
- Do not require hover, cursor movement, or the archive lamp.
- Avoid horizontal scroll.

## Accessibility

Required from the first prototype:

- Annotation markers are real buttons.
- Marker labels include the count and anchor context.
- Buttons expose `aria-expanded` and `aria-controls` where applicable.
- Open note content is reachable near its anchor in DOM order.
- Escape may close the active note stack when focus is inside annotation controls.
- Focus remains visible.
- No focus trap unless a later version uses a true modal.
- Color is not the only state indicator.
- Note counts and statuses are visible text.
- Screen readers can access note content without the desktop rail.
- The annotation layer can be hidden without hiding the article.

## Reduced-motion and no-JS fallback

- Respect `prefers-reduced-motion`.
- Disable lift, stack, cursor-follow, and archive-lamp transitions for reduced motion.
- Animate only `opacity` and `transform` when motion is allowed.
- Server-render readable note markup near anchors.
- JavaScript may upgrade the experience to collapsed/open state.
- Without JavaScript, notes should remain readable, preferably through static inline
  content or a native `<details>` fallback.
- The archive lamp is optional and must never be required for reading or finding notes.

## GitHub Pages and static export

To avoid breaking GitHub Pages:

- Do not add API routes, server actions, dynamic runtime fetching, or runtime storage.
- Do not introduce root-relative asset links outside Next's `basePath` handling.
- Do not change routes or the deployment model.
- Keep sample annotation data imported at build time from `src/lib/annotations.ts`.
- Keep all interaction client-side over static HTML and bundled data.
- Run `npm run pages:verify` after any implementation.

## Phase A scope

Smallest useful Phase A:

1. Static sample annotations for one or two existing records.
2. Deterministic paragraph and heading anchors.
3. Markers with note counts.
4. Open/collapse note stack behavior.
5. Desktop margin rail.
6. Mobile inline expansion.
7. Annotation visibility toggle.
8. Reduced-motion support.
9. No-JS readable fallback.

Optional within Phase A only if the core UI is already clean:

- Subtle archive-lamp cursor effect, disabled for reduced motion and touch/mobile.

Explicitly skipped in Phase A:

- Live submissions.
- Real storage.
- Moderation UI.
- Exact text selection.
- Replies.
- Likes, reactions, profiles, scores, or engagement metrics.
- Search.
- Route changes.

## Risks

- Paragraph IDs shift when article text is edited.
- Static sample notes are public source and must stay fake/sanitized.
- Wrapping MDX paragraphs can accidentally affect custom MDX components if done too
  broadly.
- The desktop rail can crowd the table of contents if layout is not kept simple.
- The archive lamp can become visual debt if it ships before the core annotation layer is
  usable.

## Open questions

- Should durable anchors eventually become explicit MDX attributes for records that have
  live annotations?
- Should sample annotations live in `src/lib/annotations.ts` or a static JSON sidecar once
  there are more examples?
- Which records should Phase A annotate first?
- Should annotation mode default to markers visible or fully hidden?
- What backend, if any, fits the archive later without turning it into a comment system?
