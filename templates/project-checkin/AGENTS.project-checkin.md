# archive project check-in

Use this note in any project that should report progress into `thebolanarchives`.

When the owner asks for an archive update, create a local `archive-checkin.json` in this
project. Keep it out of commits unless the owner explicitly says it is safe to publish.
Add `archive-checkin.json` to this project's `.gitignore` before writing it.

The file must be sanitized. Do not include private names, emails, private URLs,
credentials, client details, unpublished context, or local machine paths.

From `thebolanarchives`, the archive agent can write an empty form for this project:

```bash
npm run project:update -- --write-checkin ../project/archive-checkin.json --slug project-slug --tags agents,archive --tools codex
```

```json
{
  "slug": "project-slug",
  "title": "project name",
  "summary": "A short public-safe summary for a new build log.",
  "visibility": "draft",
  "tags": ["agents", "archive"],
  "tools": ["codex"],
  "current_state": "What is true now.",
  "changed": "What moved since the last check-in.",
  "uncertain": "What broke, is missing, or needs verification.",
  "public_evidence": "Only public-safe links, commands, artifacts, or observations.",
  "next_move": "The smallest concrete next step."
}
```

After writing the file, hand its path to the archive agent. From `thebolanarchives`, the
agent validates and imports it with:

```bash
npm run project:update -- --validate-checkin ../project/archive-checkin.json
npm run project:update -- --from-json ../project/archive-checkin.json
```

Default to `visibility: "draft"`. Promote to `public` only after review and the archive
checks pass.
