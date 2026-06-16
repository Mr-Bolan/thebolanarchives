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

Write an empty local check-in form:

```bash
npm run project:update -- --write-checkin archive-checkin.json --slug project-slug --tags agents,archive --tools codex
```

Import a check-in file from another project:

```bash
npm run project:update -- --from-json ../some-project/archive-checkin.json
```

New records default to `visibility: "draft"`. Existing records keep their current
visibility and get a dated update appended.

List the public project ledger:

```bash
npm run project:ledger
```

Builds also write `public/project-ledger.json` from public build logs. Do not edit that
file by hand. The `/build-logs` page reads it during static build and shows a compact
current-state shelf.

## owner input path

Use the GitHub `Project update` issue template when the owner wants to hand the agent an
occasional check-in without touching local files. The issue is public, so it must contain
only sanitized project state, public-safe evidence, and non-identifying context.

The agent should turn the issue into the smallest honest `npm run project:update --`
command, keep uncertain work as `draft`, run the checks below, and link the resulting
commit or PR back to the issue. Do not copy private evidence into the repository just
because it appeared in a public issue.

## cross-project handoff

For projects that should feed this archive, add a local `archive-checkin.json` only when
there is a sanitized update to send:

```json
{
  "slug": "project-slug",
  "title": "project name",
  "summary": "A plain 80-220 character summary for a new build log.",
  "visibility": "draft",
  "tags": ["agents", "archive"],
  "tools": ["codex"],
  "current_state": "What is true now.",
  "changed": "What moved since the last check-in.",
  "uncertain": "What broke, is missing, or needs verification.",
  "public_evidence": "Only public-safe links, commands, or observations.",
  "next_move": "The smallest concrete next step."
}
```

Keep that file local to the source project unless its contents are safe to publish. From
this archive repo, import it with `--from-json`; command-line flags can still override
the file, for example `--visibility public` after review.

To wire another repo, copy `templates/project-checkin/AGENTS.project-checkin.md` into
that repo or paste its contents into that repo's existing agent instructions.

## agent loop

1. Take the owner's rough update or project evidence.
2. Remove private names, private URLs, credentials, client details, and filler.
3. Write the smallest honest update with `npm run project:update --` or `--from-json`.
4. Run `npm run content:audit`.
5. Run `npm run project:ledger` to inspect the current tracked project state.
6. Run `npm run agent:check` before public promotion or push.

Use `--visibility public` only when the note is already safe to publish and has tags.

## checks

The script rejects obvious private data, credential terms, and scaffold text. The ledger
only includes public build logs, so draft and unlisted work stays out of public project
tracking. It does not replace human review. If the source is uncertain, leave the record
as `draft` and say what needs verification.
