# Archive Annotations data

Archive Annotations render read-only static notes. The on-page composer may prepare a
GitHub handoff, but the site does not store reader submissions or publish them at
runtime.

## where data lives

Static annotation files live in:

```text
content/annotations/<record-slug>.json
```

Each file contains a JSON array of annotations for one record only. The filename must
match every annotation's `recordSlug`.

Example:

```json
[
  {
    "id": "reader_note_001",
    "recordSlug": "why-this-exists",
    "anchorId": "p-1",
    "label": "reader note",
    "body": "This static note is sanitized source data, not a stored public submission.",
    "author": "anonymous reader",
    "created": "2026-06-15",
    "status": "approved",
    "excerpt": "This archive is not a portfolio."
  }
]
```

Allowed labels:

- `reader note`
- `field comment`
- `annotation`

Allowed statuses:

- `approved`
- `archived`

## how to add one

1. Pick the target record slug.
2. Add or edit `content/annotations/<record-slug>.json`.
3. Use a unique `id`.
4. Set `recordSlug` to the filename without `.json`.
5. Set `anchorId` to a paragraph or heading anchor.
6. Keep the body reviewed, sanitized, and read-only.
7. Run `npm run annotations:audit`.

Do not commit raw reader comments, private notes, private URLs, emails, credentials,
moderation queues, or unpublished personal context.

## anchor IDs

Paragraph anchors are generated as `p-1`, `p-2`, `p-3`, counted inside the rendered
article body after the leading record heading is removed.

Heading anchors come from the rendered `h2`, `h3`, and `h4` text. The slug rules match
`src/lib/headings.ts`: lowercase, punctuation stripped, non-alphanumeric runs collapsed
to `-`, and duplicate headings get `-2`, `-3`, and so on.

Paragraph IDs can shift when an article is edited. If paragraphs move, split, or merge,
rerun `npm run annotations:audit` and verify any `p-n` anchors still point to the right
place. For long-lived annotations, prefer a heading anchor when the note can attach to a
whole section.

## what this is not

This is not a comment system. There is no backend, database, auth, moderation UI,
replies, likes, profiles, search, or live storage. The files are public source data, so
every annotation must be safe to publish as-is.
