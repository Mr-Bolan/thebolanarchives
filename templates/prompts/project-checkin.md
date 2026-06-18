# project check-in prompt

Start at `AGENTS.md`. Use mode `site-feature` only if changing archive tooling; otherwise
write a local source-project `archive-checkin.json`.

Task:

```text
Turn the rough project update below into a sanitized `archive-checkin.json`.
Do not commit `archive-checkin.json`.
Remove private names, private URLs, credentials, client details, local paths, and filler.
Keep `visibility` as `draft` unless the owner explicitly says the update is public-safe.
Use short, concrete text. Mark uncertainty instead of hiding it.
After writing the file, the archive agent can run `npm run project:update -- --sync-project-list archive-projects.txt`.

Project slug:
<project-slug>

Rough update:
<paste owner notes here>
```
