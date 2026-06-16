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

`archive-checkin.json` is local-only and ignored in this repo. If another project uses
the same handoff, add `archive-checkin.json` to that project's `.gitignore` too.
Use `templates/prompts/project-checkin.md` when an agent needs to turn rough owner notes
into the sanitized JSON file.

Install the handoff note into another project:

```bash
npm run project:update -- --install-checkin ../some-project
npm run project:update -- --install-checkin ../some-project --slug project-slug --tags agents,archive --tools codex
```

This writes `AGENTS.project-checkin.md` in the target project, makes sure its
`.gitignore` includes `archive-checkin.json`, and adds a small `AGENTS.md` pointer so
future agents can discover the handoff note. Re-running it keeps an existing
`AGENTS.project-checkin.md` instead of overwriting local edits. When `--slug` is passed,
it also seeds an ignored `archive-checkin.json` form unless one already exists.

Check whether a project is wired for archive updates:

```bash
npm run project:update -- --check-install ../some-project
```

Write a local list for projects that should feed the archive:

```bash
npm run project:update -- --write-project-list archive-projects.txt
```

`archive-projects.txt` is ignored. Put one project directory per line, with `#` comments
allowed. Then wire or verify every listed project:

```bash
npm run project:update -- --install-project-list archive-projects.txt
npm run project:update -- --check-project-list archive-projects.txt
```

When listed projects have local `archive-checkin.json` files ready, validate or import all
present check-ins:

```bash
npm run project:update -- --sync-project-list archive-projects.txt
npm run project:update -- --validate-project-list archive-projects.txt
npm run project:update -- --import-project-list archive-projects.txt
```

Missing `archive-checkin.json` files are skipped. This lets an agent run the loop across
all wired projects without requiring every project to have a fresh update. Imported
check-ins carry a non-secret marker in the target MDX, so rerunning the same import skips
duplicates instead of appending the same update again. Batch imports validate every ready
check-in before writing any archive update, so one bad source file does not leave a
half-imported batch.

Import a check-in file from another project:

```bash
npm run project:update -- --validate-checkin ../some-project/archive-checkin.json
npm run project:update -- --from-json ../some-project/archive-checkin.json
```

New records default to `visibility: "draft"`. Existing records keep their current
visibility and get a dated update appended.

List the public project ledger:

```bash
npm run project:ledger
```

List every local build-log project state, including draft and unlisted records:

```bash
npm run project:ledger -- --all
npm run project:ledger -- --all --json
```

Builds also write `public/project-ledger.json` from public build logs. Do not edit that
file by hand. The `/build-logs` page reads it during static build and shows a compact
current-state shelf. `--all` is local command output only; it is not written into the
public ledger.

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

To wire another repo, run `--install-checkin`, copy
`templates/project-checkin/AGENTS.project-checkin.md` into that repo, or paste its
contents into that repo's existing agent instructions.

## agent loop

1. Take the owner's rough update or project evidence.
2. Remove private names, private URLs, credentials, client details, and filler.
3. Run `--sync-project-list` for the local source list, or `--check-install` for one
   source project.
4. Validate cross-project files with `--validate-project-list` or `--validate-checkin`
   before importing them.
5. Write the smallest honest update with `--import-project-list`, `--from-json`, or a
   direct `npm run project:update --` command.
6. Run `npm run content:audit`.
7. Run `npm run project:ledger -- --all` to inspect the current tracked project state.
8. Run `npm run agent:check` before public promotion or push.

Use `--visibility public` only when the note is already safe to publish and has tags.

## checks

The script rejects obvious private data, credential terms, and scaffold text. The ledger
only includes public build logs, so draft and unlisted work stays out of public project
tracking. It does not replace human review. If the source is uncertain, leave the record
as `draft` and say what needs verification.
