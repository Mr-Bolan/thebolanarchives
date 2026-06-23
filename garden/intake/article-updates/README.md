# intake: article updates

Drop a markdown file here when you want to change an article or page on the site — fix
something, add a section, correct a claim, update status, retire a record, whatever.

The next tick reads this folder (`npm run garden:intake`), turns each note into one or more
sanitized backlog items, and archives the raw note. You never commit, push, or publish —
the loop drafts, moderates, and ships the change.

## format

A note is plain markdown. The loop is tolerant, but this shape parses cleanly:

```markdown
---
target: the-dashboard-was-lying      # slug, route, or path of the page (optional)
intent: update                       # update | fix | retire | expand | correct
priority: medium                     # high | medium | low (optional)
---

What you want changed, in your own words. Be as rough as you like.
Mention anything sensitive plainly — the loop strips it before anything is committed,
and keeps the sensitive specifics only in gitignored local state.
```

No frontmatter is fine too — just write what you want. One note can describe one change or
several; the loop will split them into separate backlog items.

## privacy

Raw note bodies in this folder are gitignored. Write freely. De-identification happens in
the loop before any content is committed to a public repo.
