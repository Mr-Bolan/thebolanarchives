# Archive Annotations intake

Phase E uses GitHub Discussions as public intake and keeps the site static. The website
does not write notes to GitHub, fetch live discussions, or publish submissions at runtime.

## GitHub setup

1. Enable GitHub Discussions for the repository.
2. Create a discussion category named `archive-annotations`.
3. Keep the category slug as `archive-annotations`.
4. Keep the category form at `.github/DISCUSSION_TEMPLATE/archive-annotations.yml`.

GitHub requires the form filename to match the discussion category slug. Readers need
GitHub accounts to submit notes, and their GitHub identity is public on the discussion.

## reader handoff

The on-site composer prepares a note for the reader to copy, then opens the GitHub intake
page:

```text
https://github.com/Mr-Bolan/thebolanarchives/discussions/new?category=archive-annotations
```

The browser does not receive a token. The site does not call the GitHub API, write to a
database, or store the submitted note. Opening the intake page is an external handoff.

## publication workflow

Submitted discussions are not published on the site automatically.

Use the manual moderation path:

```text
submitted -> triage -> accepted -> published_static / archived / rejected
```

Future Phase F screening may insert an advisory step:

```text
submitted -> auto-screened -> triage -> accepted/rejected -> published_static
```

Auto-screening is not approval. It creates a review result only; accepted notes still need
human review before static publication.

For accepted notes:

1. Confirm the target record slug exists.
2. Confirm the target anchor still resolves.
3. Remove or reject private data, credentials, private URLs, identifying details, and
   unsupported claims.
4. Copy only sanitized text into `content/annotations/<record-slug>.json`.
5. Run `npm run annotations:audit`.
6. Run `npm run agent:check` and `npm run deploy:check` before publishing.

## manual JSON draft template

Use this shape when converting an accepted discussion into static annotation JSON:

```json
{
  "id": "reader_note_000",
  "recordSlug": "target-record-slug",
  "anchorId": "p-1",
  "label": "reader note",
  "body": "Sanitized note text.",
  "author": "anonymous reader",
  "created": "2026-06-16",
  "status": "approved",
  "excerpt": "Optional short excerpt."
}
```

Allowed labels are `reader note`, `field comment`, and `annotation`. Allowed static
statuses are `approved` and `archived`.

Do not commit raw GitHub discussion exports, private moderation notes, credentials,
private URLs, or unpublished personal context.
