# agent project updates

This is the archive's local update loop. It is not a CMS, database, or private memory
store. It writes normal `build_log` MDX so the existing audit, privacy, and static export
rules stay in charge.

## command

Use the script for sanitized project progress notes:

```bash
npm run project:update -- --slug project-slug --title "project name" --summary "A plain 80-220 character summary of the build log." --tags agents,archive --tools codex --note "What changed, what is true now, and what still needs checking." --next "The next concrete move."
```

Pipe longer notes through stdin:

```bash
npm run project:update -- --slug project-slug --stdin
```

New records default to `visibility: "draft"`. Existing records keep their current
visibility and get a dated update appended.

List the public project ledger:

```bash
npm run project:ledger
```

Builds also write `public/project-ledger.json` from public build logs. Do not edit that
file by hand.

## agent loop

1. Take the owner's rough update or project evidence.
2. Remove private names, private URLs, credentials, client details, and filler.
3. Write the smallest honest update with `npm run project:update --`.
4. Run `npm run content:audit`.
5. Run `npm run project:ledger` to inspect the current tracked project state.
6. Run `npm run agent:check` before public promotion or push.

Use `--visibility public` only when the note is already safe to publish and has tags.

## checks

The script rejects obvious private data, credential terms, and scaffold text. The ledger
only includes public build logs, so draft and unlisted work stays out of public project
tracking. It does not replace human review. If the source is uncertain, leave the record
as `draft` and say what needs verification.
