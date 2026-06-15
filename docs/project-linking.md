# project linking

Content records may link to Mr-Bolan projects without creating a separate projects route.

Do not add `/projects` yet. Project links belong on the relevant archive record until there is enough material to justify a route.

## Frontmatter

`external_links` is optional.

```yaml
external_links:
  - label: "project repository"
    url: "https://github.com/Mr-Bolan/example-project"
    kind: "repository"
  - label: "live demo"
    url: "https://example.invalid/demo"
    kind: "demo"
```

Allowed `kind` values:

- `repository`
- `demo`
- `documentation`
- `related-site`
- `artifact`

Rules:

- Use public URLs only.
- Use labels that explain the destination, not hype.
- Prefer one or two useful links over a directory of everything.
- Do not link private repositories, private demos, credentials, dashboards, or admin tools.
- Keep `related` for internal archive slugs; use `external_links` for outside projects and artifacts.

External links render on content detail pages when present.
