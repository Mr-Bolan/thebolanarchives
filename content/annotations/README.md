# annotation sidecars

Static annotation files in this folder are public repository data.

Use one JSON file per target record:

```text
content/annotations/<record-slug>.json
```

Each file must be a JSON array. Every annotation inside it must use the same `recordSlug`
as the filename without `.json`.

Only sanitized, read-only annotations belong here. Generated reader notes may be exported
from GitHub Discussions by `npm run discussions:export` after they pass the Archive Intake
Screener. Do not commit raw reader submissions, private notes, private URLs, emails,
credentials, moderation queues, or unpublished personal context.

Anchor IDs:

- `p-1`, `p-2`, `p-3` attach to detected article paragraphs.
- heading anchors attach to rendered `h2`, `h3`, or `h4` IDs.
- paragraph anchors can drift when an article is edited.

Run this after edits:

```bash
npm run annotations:audit
```

Run this before expecting a new record to have a GitHub intake space:

```bash
npm run discussions:sync
```
