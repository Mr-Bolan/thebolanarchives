# Archive Annotations intake

Archive Annotations use GitHub Discussions as public intake and keep the website static.
The browser does not call the GitHub API or receive a token.

## GitHub setup

1. Enable GitHub Discussions for the repository.
2. Create a discussion category named `archive-annotations`.
3. Keep the category slug as `archive-annotations`.
4. Keep the category form at `.github/DISCUSSION_TEMPLATE/archive-annotations.yml`.

GitHub requires the form filename to match the discussion category slug. The custom
category is a one-time GitHub setup step; the repository automation can create discussions
inside an existing category, but it does not create categories.

If `archive-annotations` is missing, `npm run discussions:sync` falls back to the existing
`general` category so per-record discussion threads can still be created and routed.

Readers need GitHub accounts to submit notes, and their GitHub identity is public on the
discussion.

## per-record discussion space

Each public or unlisted archive record should have one GitHub Discussion in the
`archive-annotations` category.

Run:

```bash
npm run discussions:sync
```

The command:

- reads published and unlisted MDX records
- checks whether a matching Discussion exists
- creates missing Discussions with an archive marker in the body
- writes `content/annotation-discussions.json`

The website reads this registry. If a record has a mapped discussion, the composer opens
that discussion so the reader can paste the prepared note as a reply. If the registry does
not yet have the record, the composer falls back to a new discussion draft URL.

If the `archive-annotations` category is missing and `general` is also unavailable, GitHub
may return a 404 for intake URLs and the sync command will fail with a setup message.

## reader handoff

The on-site composer prepares a note for the reader to copy:

```text
target record slug:
why-this-exists

target anchor ID:
p-1

short excerpt:
optional passage clue

note body:
the note

display name / pseudonym:
anonymous reader
```

For records with a discussion registry entry, the composer opens the record discussion.
For records without one, it opens a prefilled new discussion draft:

```text
https://github.com/Mr-Bolan/thebolanarchives/discussions/new?category=archive-annotations&title=...
```

## publication workflow

The automated path is:

```text
submitted GitHub comment -> rules screen -> exported static JSON PR -> review -> publish
```

Clear notes are exported by `npm run discussions:export` into
`content/annotations/<record-slug>.json` with a `sourceUrl` pointing to the GitHub
comment. Notes that are blocked, invalid, or need review stay in GitHub and do not render
on the archive.

Before publishing:

```bash
npm run annotations:audit
npm run agent:check
npm run deploy:check
```

Do not commit raw GitHub discussion exports, private moderation notes, credentials,
private URLs, or unpublished personal context.
