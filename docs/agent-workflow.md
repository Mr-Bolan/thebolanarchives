# agent workflow

Pick one mode before editing. If a task spans modes, do the smallest needed set and report each mode touched.

| mode | editable files | forbidden files | required commands | commit message | final report |
| --- | --- | --- | --- | --- | --- |
| `content-capture` | `content/inbox/**` | `src/**`, `.github/**`, `next.config.mjs`, `package*.json`, public routes | none if inbox only; `npm run content:audit` if promoted | `capture content: <topic>` | files, capture location, promotion status, checks |
| `content-draft` | `content/<type>/*.mdx`, `templates/content/**` | `src/**`, deploy files, package files | `npm run content:audit` | `draft content: <slug>` | files, type, visibility, audit result |
| `content-update` | existing `content/<type>/*.mdx`, content docs | routes, styles, deploy files, package files | `npm run content:audit`; `npm run build` if public/unlisted | `update content: <slug>` | files, changed record, visibility, checks |
| `content-publish` | MDX frontmatter/body needed for publication, `public/archive-index.json` via build | route/design/deploy changes, unrelated rewrites | `npm run content:audit`, `npm run privacy:audit`, `npm run build`, `npm run pages:verify` | `publish content: <slug>` | files, public/unlisted/draft behavior, checks |
| `project-link` | MDX `external_links`, `docs/project-linking.md` | new `/projects` route, new CMS/database/search | `npm run content:audit`; `npm run build` if rendered | `link project: <slug>` | files, links added, render/schema status, checks |
| `site-feature` | focused `src/**`, `scripts/**`, matching docs | CMS, database, search, route changes not requested, deployment model changes | `npm run agent:check` | `add site feature: <feature>` | files, behavior, route impact, checks |
| `visual-polish` | `src/styles/**`, focused components, design docs | content meaning, routes, deploy model | `npm run build`, `npm run pages:verify` | `polish visual: <area>` | files, visual areas, theme check, checks |
| `deploy-maintenance` | `.github/**`, `next.config.mjs`, `docs/deploy.md`, deploy scripts, package scripts | content rewrites, visual redesign, new domain unless asked | `npm run deploy:check`, `npm run agent:check` | `maintain deploy: <area>` | files, deploy behavior, Pages/basePath status, checks |

Final reports should stay short:

```text
mode(s):
files:
checks:
publish/deploy behavior:
risks:
```

If checks cannot run, say exactly why and leave the smallest next command.
