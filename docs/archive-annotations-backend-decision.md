# Archive Annotations backend decision

Decision date: 2026-06-16

## decision

Use GitHub Discussions as the lightweight historical intake and storage layer for future
reader notes. Keep the published website static: approved annotations are still curated
into `content/annotations/<record-slug>.json` and shipped at build time.

This means Phase E, if started, should not add an embedded anonymous comment backend. It
should add only a narrow GitHub Discussions intake path and a static publication workflow.

## why this fits

- GitHub Pages stays static and fast.
- No API routes, server actions, CMS, database, or runtime fetches are needed.
- No client-side secrets are needed.
- GitHub provides durable public history, discussion forms, moderation tools, locks,
  deletes, interaction limits, labels, and API export.
- The archive owner can remain pseudonymous through the public repository identity.
- Reader notes are not promised to be anonymous. They are public GitHub submissions.

This deliberately trades true anonymous visitor posting for a much safer historical
record. If true anonymous posting becomes a hard requirement, this decision should be
reopened instead of quietly adding a database.

## chosen shape

```text
reader
  -> GitHub Discussion form in an archive-annotations category
  -> maintainer triage/moderation in GitHub
  -> accepted note copied or exported into content/annotations/*.json
  -> npm run annotations:audit
  -> static site build
```

The on-site Phase C composer remains mock-only until a later phase replaces it with a
GitHub handoff or removes it. It must not post directly from the static client with a
token.

## option assessments

### 1. GitHub Discussions or Issues

- Static GitHub Pages compatibility: strong if GitHub is used as an external intake page
  and static JSON remains the render source.
- Anonymous visitor support: no true anonymous posting. Visitors need GitHub accounts, or
  at least pseudonymous GitHub accounts.
- Spam protection: acceptable for this archive because GitHub account friction,
  repository interaction limits, report/block tools, locks, and deletes exist.
- Moderation queue: workable through a dedicated discussion category, labels, pinned
  triage guidance, and manual review before publication.
- Hide/delete workflow: GitHub discussions and comments can be edited/deleted/locked; the
  static site can hide a published note by removing it from JSON and rebuilding.
- Abuse handling: best of the evaluated lightweight options because abuse stays inside
  GitHub's public moderation surface instead of a custom anonymous form.
- Data export/archive path: GitHub Discussions GraphQL API can read, create, edit, and
  delete discussion posts; manual export is also possible for low volume.
- Cost/complexity: lowest. No new vendor account beyond the existing repository, no
  database schema, no server, no billing surface for the site.
- Privacy/anonymity risk: low for the archive owner, medium for submitters because their
  GitHub identity is public. The UI must say this plainly.
- Fit with Blackbox Garden tone: good if framed as an external field-note inbox, not a
  social comment wall.
- Implementation effort: low. Configure a category/form, add a link or external handoff,
  keep static publication.
- Secrets/env vars needed: none for manual intake. A future GitHub Actions export may use
  the built-in `GITHUB_TOKEN`, but never a browser-exposed token.
- Custom domain/server needed: no.
- Decision: choose this, with Discussions preferred over Issues. Use Issues only if
  Discussions are unavailable.

### 2. Supabase

- Static GitHub Pages compatibility: possible from a client, but it introduces live
  external Auth/Postgres state to a static archive.
- Anonymous visitor support: supported through anonymous sign-ins, but anonymous users are
  still stored users and use the authenticated role.
- Spam protection: possible with CAPTCHA and auth rate limits, but it becomes a site-owned
  abuse surface.
- Moderation queue: custom tables, statuses, RLS policies, and moderator tooling required.
- Hide/delete workflow: custom implementation required.
- Abuse handling: custom implementation required beyond provider rate limits.
- Data export/archive path: strong because data lives in Postgres, but that is also the
  added operational burden.
- Cost/complexity: medium to high for this archive because it adds a database, auth
  policy design, and vendor operations.
- Privacy/anonymity risk: medium. It avoids public GitHub handles, but creates account
  IDs, provider logs, policy mistakes, and dashboard exposure risk.
- Fit with Blackbox Garden tone: weak to medium; it trends toward a real comment system.
- Implementation effort: medium to high.
- Secrets/env vars needed: publishable project key in the client; service role key only in
  server/CI if automation exists; CAPTCHA secret in provider dashboard.
- Custom domain/server needed: no custom server for basic client writes, but any safe
  moderation/export automation would likely need server/CI code.
- Decision: reject for now.

### 3. Firebase

- Static GitHub Pages compatibility: possible through client SDKs.
- Anonymous visitor support: supported through Firebase anonymous auth.
- Spam protection: possible with App Check and reCAPTCHA Enterprise, but not complete.
- Moderation queue: custom Firestore/Realtime Database schema and tooling required.
- Hide/delete workflow: custom implementation required.
- Abuse handling: custom rules, quotas, App Check, and operational monitoring required.
- Data export/archive path: possible through Firebase/Google tooling, but not archive-native.
- Cost/complexity: medium to high for a small static archive.
- Privacy/anonymity risk: medium. Public Firebase config is expected, but the archive now
  owns Google project identifiers, auth state, logs, and rule correctness.
- Fit with Blackbox Garden tone: weak; it invites an app backend.
- Implementation effort: medium to high.
- Secrets/env vars needed: public Firebase config; service account secrets for admin or
  export automation; App Check/reCAPTCHA configuration.
- Custom domain/server needed: no custom server for basic client writes, but robust abuse
  handling or export may need Cloud Functions or CI automation.
- Decision: reject for now.

### 4. Appwrite

- Static GitHub Pages compatibility: possible through client SDKs against Appwrite Cloud or
  a self-hosted endpoint.
- Anonymous visitor support: supported through anonymous sessions.
- Spam protection: rate limits exist, but moderation still belongs to this project.
- Moderation queue: custom tables, permissions, statuses, and moderator workflow required.
- Hide/delete workflow: custom implementation required.
- Abuse handling: custom implementation required beyond Appwrite rate limits.
- Data export/archive path: possible through Appwrite APIs, but not as lightweight as the
  existing static JSON path.
- Cost/complexity: medium. Cloud is another vendor; self-hosting is too much for this
  archive.
- Privacy/anonymity risk: medium. It reduces public submitter identity but adds provider
  account, endpoint, permissions, and logs.
- Fit with Blackbox Garden tone: weak to medium; still a backend product.
- Implementation effort: medium.
- Secrets/env vars needed: public endpoint/project ID; API keys for server/export/admin
  automation.
- Custom domain/server needed: no custom domain for Appwrite Cloud; self-hosting would
  require server operations.
- Decision: reject for now.

### 5. Custom lightweight API

- Static GitHub Pages compatibility: weak. GitHub Pages cannot run server code, so this
  requires a separate hosted function/API.
- Anonymous visitor support: possible, but then the project owns the full abuse problem.
- Spam protection: custom CAPTCHA, rate limits, IP handling, and monitoring required.
- Moderation queue: custom implementation required.
- Hide/delete workflow: custom implementation required.
- Abuse handling: custom implementation required.
- Data export/archive path: custom implementation required.
- Cost/complexity: highest relative risk, even if the first endpoint is small.
- Privacy/anonymity risk: high. A custom API creates logs, secrets, operational mistakes,
  and a new identity surface.
- Fit with Blackbox Garden tone: poor for now; it turns an archive feature into service
  operations.
- Implementation effort: high.
- Secrets/env vars needed: database/API credentials, CAPTCHA secret, deployment secrets.
- Custom domain/server needed: yes, unless hidden behind a vendor function URL.
- Decision: reject.

### 6. No live backend; keep annotations editorial/static

- Static GitHub Pages compatibility: strongest.
- Anonymous visitor support: not applicable because there is no public submission path.
- Spam protection: strongest because there is no public write surface.
- Moderation queue: unnecessary.
- Hide/delete workflow: edit static JSON and rebuild.
- Abuse handling: unnecessary.
- Data export/archive path: strongest for published notes because source data is in Git.
- Cost/complexity: lowest.
- Privacy/anonymity risk: lowest.
- Fit with Blackbox Garden tone: strongest for curated marginalia.
- Implementation effort: lowest.
- Secrets/env vars needed: none.
- Custom domain/server needed: no.
- Decision: keep as the fallback. It fails the user's historical-submission goal, so it is
  not the primary recommendation.

## source notes

- GitHub discussion forms and management:
  https://docs.github.com/en/discussions/managing-discussions-for-your-community/creating-discussion-category-forms
  and https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions
- GitHub Discussions API authentication/export shape:
  https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions
- GitHub moderation and interaction limits:
  https://docs.github.com/en/discussions/managing-discussions-for-your-community/moderating-discussions
  and https://docs.github.com/en/communities/moderating-comments-and-conversations/limiting-interactions-in-your-repository
- Supabase anonymous sign-ins, RLS, CAPTCHA, and rate limits:
  https://supabase.com/docs/guides/auth/auth-anonymous
  https://supabase.com/docs/guides/database/postgres/row-level-security
  https://supabase.com/docs/guides/auth/auth-captcha
  https://supabase.com/docs/guides/auth/rate-limits
- Firebase anonymous auth, App Check, and API key handling:
  https://firebase.google.com/docs/auth/web/anonymous-auth
  https://firebase.google.com/docs/app-check
  https://firebase.google.com/docs/projects/api-keys
- Appwrite anonymous sessions, database permissions, and rate limits:
  https://appwrite.io/docs/products/auth/anonymous
  https://appwrite.io/docs/products/databases/permissions
  https://appwrite.io/docs/advanced/platform/rate-limits
