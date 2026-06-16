# annotation sidecars

Static annotation files in this folder are public repository data.

Use one JSON file per target record:

```text
content/annotations/<record-slug>.json
```

Each file must be a JSON array. Every annotation inside it must use the same `recordSlug`
as the filename without `.json`.

Only fake, sanitized, read-only annotations belong here. Do not commit real reader
submissions, private notes, private URLs, emails, credentials, moderation queues, or
unpublished personal context.

Anchor IDs:

- `p-1`, `p-2`, `p-3` attach to detected article paragraphs.
- heading anchors attach to rendered `h2`, `h3`, or `h4` IDs.
- paragraph anchors can drift when an article is edited.

Run this after edits:

```bash
npm run annotations:audit
```
