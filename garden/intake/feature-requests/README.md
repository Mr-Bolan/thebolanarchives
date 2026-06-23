# intake: feature requests

Drop a markdown file here when you notice something about the app you want to change, add,
or fix — a new component, a layout tweak, a script, a graph improvement, a bug. This is the
"put it on the note and the loop handles it" folder for code and features.

The next tick reads this folder (`npm run garden:intake`), turns each note into a sanitized
backlog item with a task mode, and the loop drafts it, moderates it, and publishes it when
it is ready and significant. You never commit, push, or publish.

## format

```markdown
---
area: graph            # graph | content | layout | scripts | deploy | docs (optional)
kind: feature          # feature | fix | refactor | chore
priority: high         # high | medium | low (optional)
---

What you want, in your own words. Describe the outcome, not the implementation,
unless you care about the implementation.
```

No frontmatter is fine — just describe what you want. The loop maps it to a task mode from
`docs/agent-workflow.md` (usually `site-feature` or `visual-polish`) and keeps the change
in the smallest scope that satisfies it.

## scope notes

- Big or risky changes become `deferred` backlog items the loop works carefully behind
  `npm run agent:check`, not rushed publishes.
- Changes to the operating layer itself (`garden/ORCHESTRATOR.md`, stage contracts) are
  owner-directed and strongest-tier — say so explicitly in the note if that is what you
  want.
