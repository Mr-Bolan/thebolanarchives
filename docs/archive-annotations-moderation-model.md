# Archive Annotations moderation model

This model assumes the Phase D decision in
`docs/archive-annotations-backend-decision.md`: GitHub Discussions stores submitted notes
as public historical records, while the website renders only curated static annotations.

## principles

- The article stays primary.
- The site stays static.
- Every public submission is treated as public source, not private correspondence.
- The archive does not promise reader anonymity when GitHub is the intake layer.
- No note is published on the site until it is reviewed and copied or exported into
  `content/annotations/*.json`.
- No private names, private emails, private URLs, credentials, or unpublished personal
  context are accepted.

## intake fields

A future GitHub Discussion form should ask for only:

- target record slug
- target anchor ID, if known
- short excerpt, optional
- note body
- display name or pseudonym, optional
- checkbox: "I understand this GitHub submission is public."
- checkbox: "This note contains no private data, credentials, or identifying details."

Do not ask for email, real name, location, employer, account handles outside GitHub, or
private contact information.

## moderation states

| state | meaning | site behavior |
| --- | --- | --- |
| `submitted` | note exists in GitHub and has not been reviewed | not rendered |
| `triage` | maintainer is checking anchor, privacy, and usefulness | not rendered |
| `needs edit` | useful but contains unclear or risky details | not rendered |
| `accepted` | safe enough to convert into static annotation JSON | pending commit |
| `published_static` | copied/exported into `content/annotations/*.json` and checked | rendered after deploy |
| `archived` | preserved in GitHub but not rendered | not rendered |
| `rejected` | spam, abuse, private data, or wrong fit | not rendered |

GitHub labels can mirror these states. The static JSON status remains constrained by the
current annotation data model unless a later phase explicitly expands it.

## review checklist

Before publishing a submitted note:

1. Confirm the target record slug exists.
2. Confirm the anchor ID still resolves with `npm run annotations:audit`.
3. Remove or reject private details, credentials, private URLs, identifying data, and
   unsupported claims.
4. Keep the note short enough to behave like marginalia.
5. Preserve uncertainty in the wording.
6. Choose one of the current labels: `reader note`, `field comment`, or `annotation`.
7. Add only sanitized text to `content/annotations/<record-slug>.json`.
8. Run `npm run annotations:audit` and the required repo checks before publishing.

## hide and delete

To hide a site-published annotation:

1. Remove it from `content/annotations/*.json`, or change it to an archived static note if
   a later data model supports that.
2. Run `npm run annotations:audit`.
3. Commit and deploy the static change.

To handle the GitHub source discussion:

- Close or lock a resolved thread when no further discussion is wanted.
- Delete comments only for spam, abuse, private data, credentials, or clear safety issues.
- Leave an administrative note when useful, but do not over-explain private moderation.

## abuse controls

Start with GitHub's built-in controls:

- GitHub account requirement.
- Dedicated discussion category.
- Discussion category form with required fields.
- Repository interaction limits during spam waves.
- Locks on noisy threads.
- Delete/report/block for abuse.

If those controls are not enough, pause intake by disabling the public link or closing the
category. Do not add an anonymous custom backend as a quick patch.

## archive path

The historical source of a submitted note is the GitHub Discussion. The published archive
copy is the sanitized JSON annotation committed to the repository.

For low volume, manual copy is acceptable and preferred. Automation can be considered only
after the manual process is boring and stable. Any automation must run in GitHub Actions or
another server context; it must not expose a GitHub token in browser code.

## phase gates

Phase E should proceed only if all of these stay true:

- GitHub Discussions are acceptable as a public, non-anonymous intake surface.
- The site does not fetch live comments at runtime.
- The first implementation can work without new secrets.
- The moderation workflow is manual-first.
- Static JSON remains the only source rendered by the website.
