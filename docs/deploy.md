# deploy

This archive deploys to GitHub Pages as a static Next.js export at the project URL
`https://mr-bolan.github.io/thebolanarchives/`. The site uses `output: "export"` in
`next.config.mjs`; the workflow builds the `out/` directory and publishes that directory
as the Pages artifact.

Because this is a GitHub Pages project site, production builds use
`basePath: "/thebolanarchives"` and `assetPrefix: "/thebolanarchives/"`. Local
development stays at root `/`. If the site later moves to a real custom domain served at
root, revisit this configuration before publishing.

GitHub Pages serves a static site from an `index.html` file. For this site, Next.js
generates that file at `out/index.html` during `npm run build`. The repository should use
GitHub Pages Source: `GitHub Actions`, not `Deploy from branch`; the workflow publishes
the generated `out/` directory directly.

## workflow

The deploy workflow is `.github/workflows/deploy-pages.yml`.

It runs on pushes to `main` and can also be started manually from the Actions tab. If the
repository uses a different default branch, change the branch name in the workflow before
publishing.

The workflow does this:

1. checks out the repository
2. installs dependencies with `npm ci`
3. runs `npm audit --audit-level=high`
4. runs `npm run content:audit`
5. runs `npm run build`
6. runs `npm run pages:verify` to verify the exported Pages artifact
7. runs `npm run public-output:audit` to reject exported filler text
8. uploads `out/`
9. deploys the artifact to the `github-pages` environment

## repository settings

In GitHub, open the repository and set:

1. Settings -> Pages -> Build and deployment -> Source: `GitHub Actions`
   - Do not use `Deploy from branch`; this project publishes the built `out/` artifact.
2. Settings -> Actions -> General: Actions enabled for the repository
3. Settings -> Pages -> Custom domain: only set this when the real domain is known

The workflow declares the Pages permissions it needs: `pages: write` and `id-token: write`
on the deploy job, with repository contents read-only elsewhere.

## custom domain and CNAME

No custom domain is currently configured in this repository, and no `public/CNAME` file is
committed.

When a real domain exists, set the same hostname in two places:

1. GitHub repository Settings -> Pages -> Custom domain
2. `public/CNAME`, with exactly one hostname and no protocol

Example shape only:

```text
archive.example.com
```

Do not commit `CHANGE-ME.example.com` or any other placeholder. Next.js copies
`public/CNAME` into `out/CNAME` during `npm run build`; GitHub Pages then receives it with
the deployed artifact.

## local test

Before publishing:

```bash
npm ci
npm run deploy:check
```

`npm run deploy:check` runs `npm run content:audit`, `npm run build`, and
`npm run pages:verify`, then scans exported HTML, JSON, TXT, XML, CNAME text, and high-signal JS/CSS bundle text with `npm run public-output:audit`.
The verifier checks that GitHub Pages will receive `out/index.html`,
`out/archive-index.json`, `out/project-ledger.json`, the generated `_next` assets when
referenced, and the exported route files for `/about`, `/index`, and the archive
collection pages.

To inspect the exported site locally after the build:

```bash
python -m http.server 4173 --directory out
```

Then open `http://localhost:4173/thebolanarchives/` and check the main navigation routes.

## preflight checklist

- Run `npm run content:audit`.
- Run `npm run build`.
- Run `npm run pages:verify`.
- Run `npm run public-output:audit`.
- Verify the static export output exists: `out/index.html`, `out/archive-index.json`, `out/project-ledger.json`, and route HTML files under `out/`.
- Confirm only public records appear in public lists and `public/archive-index.json`.
- Confirm no personal identity leaks in content, metadata, docs, or public assets.
- Confirm draft records do not generate routes.
- Confirm unlisted records have direct routes but stay out of public lists and `archive-index.json`.
- Confirm navigation routes work under `/thebolanarchives`: `/`, `/entries`, `/field-notes`, `/build-logs`, `/fragments`, `/patterns`, `/experiments`, `/graveyard`, `/index`, `/about`.
- Confirm the custom domain and `public/CNAME` are correct before publish, or leave `public/CNAME` absent.
