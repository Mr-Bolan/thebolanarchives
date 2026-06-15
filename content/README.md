# content/

All publishable writing for the archive lives here as MDX files, one subfolder per content type.

- Each subfolder maps to a content type and a top-level route.
- Posts are `slug.mdx` with frontmatter (see `docs/content-model.md` and `docs/content-authoring.md`).
- The content loader ignores `README.md` files and ignores `content/inbox/`.
- Drafts in real content folders use `visibility: "draft"` and do not generate static routes.

Loose notes can start in `content/inbox/`. Promote them by copying useful text into one of the real folders below.

| folder | content type | route |
| --- | --- | --- |
| `entries/` | `entry` | `/entries` |
| `field-notes/` | `field_note` | `/field-notes` |
| `build-logs/` | `build_log` | `/build-logs` |
| `fragments/` | `fragment` | `/fragments` |
| `patterns/` | `pattern` | `/patterns` |
| `experiments/` | `experiment` | `/experiments` |
| `graveyard/` | `graveyard_note` | `/graveyard` |

`inbox/` is not a content type and has no route.
