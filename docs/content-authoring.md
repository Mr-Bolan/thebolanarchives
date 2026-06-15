# content authoring

Use this workflow when adding archive writing without changing site code.

## add a new MDX record

1. Pick the content type and copy its template from `templates/content/`.
2. Paste it into the matching content folder as `your-slug.mdx`.
3. Set `slug` to the same kebab-case filename, without `.mdx`.
4. Fill the required frontmatter: `title`, `type`, `status`, `confidence`, `summary`, `created`, `updated`, `tags`, `tools`, `narrative_origin`, `visibility`, and `related`.
5. Write the body below the frontmatter.
6. Run `npm run content:audit`.
7. Run `npm run build` before promoting anything public.

Folder map:

| type | folder | template |
| --- | --- | --- |
| `entry` | `content/entries/` | `templates/content/entry.mdx` |
| `field_note` | `content/field-notes/` | `templates/content/field-note.mdx` |
| `build_log` | `content/build-logs/` | `templates/content/build-log.mdx` |
| `fragment` | `content/fragments/` | `templates/content/fragment.mdx` |
| `pattern` | `content/patterns/` | `templates/content/pattern.mdx` |
| `experiment` | `content/experiments/` | `templates/content/experiment.mdx` |
| `graveyard_note` | `content/graveyard/` | `templates/content/graveyard-note.mdx` |

## draft, unlisted, public

Use `content/inbox/` for loose notes that should not be audited or published. The loader does not read that folder.

Use `visibility: "draft"` inside a real content folder when the record should be audited but should not generate a static route.

Use `visibility: "unlisted"` when the record should generate a direct URL but stay out of homepage, collection pages, `/index`, and `archive-index.json`. Unlisted pages also ask robots not to index them.

Use `visibility: "public"` when the record is ready for public lists and the public archive index.

## status vs confidence

`status` is maturity: `fragment`, `sketch`, `working_note`, `field_tested`, `stable_artefact`, or `retired`.

`confidence` is claim strength: `low`, `partial`, `medium`, `high`, or `field_confirmed`.

Do not upgrade either one for polish. A well-written note can still be `sketch` with `partial` confidence.

## related records

Add related records by slug:

```yaml
related:
  - "operator-knowledge-as-signal"
  - "data-trust-ladder"
```

The slug must exist. Draft targets are allowed in draft work, but links to draft targets will not render on public pages.

## agent-safe updates

When an agent adds or updates content:

1. Read `codex.md`, `docs/content-model.md`, and this file.
2. Prefer `content/inbox/` for rough capture.
3. Use the matching template for new records.
4. Preserve existing `slug`, filename, `record_id`, `created`, and `type` unless the owner asked for a rename or move.
5. Update `updated` when the body or metadata changes.
6. Keep `field_confirmed` only when `last_verified`, `source_context`, or body evidence supports it.
7. Run `npm run content:audit`; run `npm run build` before public promotion.

## when only adding writing

Do not change `src/`, styles, routes, package files, build config, components, visual theme, or deploy settings when the task is only content authoring. Add or edit MDX, inbox notes, templates, or content docs only.
