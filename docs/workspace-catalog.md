# workspace catalog (generated)

Generated inventory of the workspace so any agent can route without re-scanning. Do not
edit by hand — run `npm run garden:catalog` to regenerate. The orchestrator keeps this
current; `npm run garden:catalog -- --check` fails if it has drifted.

Last generated: 2026-06-23

## routes

| route | file |
| --- | --- |
| `/` | src/app/page.tsx |
| `/about` | src/app/about/page.tsx |
| `/build-logs` | src/app/build-logs/page.tsx |
| `/build-logs/:slug` | src/app/build-logs/[slug]/page.tsx |
| `/entries` | src/app/entries/page.tsx |
| `/entries/:slug` | src/app/entries/[slug]/page.tsx |
| `/experiments` | src/app/experiments/page.tsx |
| `/experiments/:slug` | src/app/experiments/[slug]/page.tsx |
| `/field-notes` | src/app/field-notes/page.tsx |
| `/field-notes/:slug` | src/app/field-notes/[slug]/page.tsx |
| `/fragments` | src/app/fragments/page.tsx |
| `/fragments/:slug` | src/app/fragments/[slug]/page.tsx |
| `/garden` | src/app/garden/page.tsx |
| `/graveyard` | src/app/graveyard/page.tsx |
| `/graveyard/:slug` | src/app/graveyard/[slug]/page.tsx |
| `/index` | src/app/index/page.tsx |
| `/patterns` | src/app/patterns/page.tsx |
| `/patterns/:slug` | src/app/patterns/[slug]/page.tsx |

## components

| component | folder | file |
| --- | --- | --- |
| AnnotationAnchor | annotations | src/components/annotations/AnnotationAnchor.tsx |
| AnnotationMarker | annotations | src/components/annotations/AnnotationMarker.tsx |
| AnnotationNote | annotations | src/components/annotations/AnnotationNote.tsx |
| ArchiveAnnotations | annotations | src/components/annotations/ArchiveAnnotations.tsx |
| ArchiveCard | archive | src/components/archive/ArchiveCard.tsx |
| ArchiveIndex | archive | src/components/archive/ArchiveIndex.tsx |
| ArchiveMetaCard | archive | src/components/archive/ArchiveMetaCard.tsx |
| CollectionPage | archive | src/components/archive/CollectionPage.tsx |
| ConfidenceBadge | archive | src/components/archive/ConfidenceBadge.tsx |
| ContentDetailPage | archive | src/components/archive/ContentDetailPage.tsx |
| RelatedArtifacts | archive | src/components/archive/RelatedArtifacts.tsx |
| StatusBadge | archive | src/components/archive/StatusBadge.tsx |
| TagList | archive | src/components/archive/TagList.tsx |
| ArchiveGraph | experiments | src/components/experiments/ArchiveGraph.tsx |
| ExperimentFrame | experiments | src/components/experiments/ExperimentFrame.tsx |
| Footer | layout | src/components/layout/Footer.tsx |
| Header | layout | src/components/layout/Header.tsx |
| SiteShell | layout | src/components/layout/SiteShell.tsx |
| Nav | navigation | src/components/navigation/Nav.tsx |
| CodeBlock | writing | src/components/writing/CodeBlock.tsx |
| DiagramBlock | writing | src/components/writing/DiagramBlock.tsx |
| MdxRenderer | writing | src/components/writing/MdxRenderer.tsx |
| OpenQuestions | writing | src/components/writing/OpenQuestions.tsx |
| SideNote | writing | src/components/writing/SideNote.tsx |
| TableOfContents | writing | src/components/writing/TableOfContents.tsx |
| TerminalBlock | writing | src/components/writing/TerminalBlock.tsx |

## lib modules

| module | exports |
| --- | --- |
| src/lib/annotation-discussions.ts | AnnotationDiscussion, annotationDiscussionRepository, annotationDiscussionCategorySlug, defaultAnnotationDiscussionUrl, getAnnotationDiscussionForRecord |
| src/lib/annotations.ts | ArchiveAnnotation, MockArchiveAnnotation, RenderedArchiveAnnotation, getAnnotationsForRecord, getAnnotationsByAnchor |
| src/lib/content.ts | COLLECTIONS, COLLECTION_FOLDERS, CollectionFolder, ContentType, ContentStatus, ContentConfidence, ContentVisibility, ExternalLinkKind, ExternalLink, ArchiveItem, ContentItem, getAllContent, getAllArchiveItems, getRecentContent, getListedContent, getCollectionContent, getCollectionArchiveItems, getContentBySlug, getContentByFolderAndSlug, getStaticParamsForCollection, getRelatedContent, getArchiveYears, getArchiveTags, getArchiveTools |
| src/lib/graph.ts | GraphNodeKind, GraphNode, GraphEdgeKind, GraphEdge, ArchiveGraph, recordNodeId, tagNodeId, buildArchiveGraph, getArchiveGraph |
| src/lib/headings.ts | TocHeading, getMarkdownHeadings, slugifyHeading, textFromChildren |
| src/lib/page-metadata.ts | getCollectionMetadata, getContentMetadata |

## scripts

- garden/scripts/backlog.mjs
- garden/scripts/catalog.mjs
- garden/scripts/intake.mjs
- garden/scripts/lib/garden-core.mjs
- garden/scripts/moderate.mjs
- garden/scripts/snapshot.mjs
- scripts/annotations-audit.mjs
- scripts/archive-discussions.mjs
- scripts/content-audit.mjs
- scripts/privacy-audit.mjs
- scripts/project-update.mjs
- scripts/public-output-audit.mjs
- scripts/verify-pages-export.mjs
- scripts/write-graph.mjs

## npm scripts

| script | command |
| --- | --- |
| `dev` | `next dev` |
| `prebuild` | `node scripts/content-audit.mjs --write-index && node scripts/project-update.mjs --write-ledger && node scripts/write-graph.mjs` |
| `build` | `next build` |
| `project:update` | `node scripts/project-update.mjs` |
| `project:ledger` | `node scripts/project-update.mjs --list` |
| `garden:snapshot` | `node garden/scripts/snapshot.mjs` |
| `garden:catalog` | `node garden/scripts/catalog.mjs` |
| `garden:intake` | `node garden/scripts/intake.mjs` |
| `garden:backlog` | `node garden/scripts/backlog.mjs` |
| `garden:moderate` | `node garden/scripts/moderate.mjs` |
| `garden:self-check` | `node garden/scripts/snapshot.mjs --self-check && node garden/scripts/catalog.mjs --self-check && node garden/scripts/intake.mjs --self-check && node garden/scripts/backlog.mjs --self-check && node garden/scripts/moderate.mjs --self-check && node scripts/write-graph.mjs --self-check` |
| `content:audit` | `node scripts/content-audit.mjs` |
| `annotations:audit` | `node scripts/annotations-audit.mjs` |
| `discussions:self-check` | `node scripts/archive-discussions.mjs --self-check` |
| `discussions:sync` | `node scripts/archive-discussions.mjs --sync` |
| `discussions:export` | `node scripts/archive-discussions.mjs --export-clear` |
| `privacy:audit` | `node scripts/privacy-audit.mjs` |
| `public-output:audit` | `node scripts/public-output-audit.mjs` |
| `pages:verify` | `node scripts/verify-pages-export.mjs` |
| `deploy:check` | `npm run content:audit && npm run build && npm run pages:verify && npm run public-output:audit` |
| `agent:check` | `npm run garden:self-check && npm run project:update -- --self-check && npm run content:audit -- --self-check && npm run discussions:self-check && npm run privacy:audit -- --self-check && npm run public-output:audit -- --self-check && npm run content:audit && npm run annotations:audit && npm run privacy:audit && npm run build && npm run pages:verify && npm run public-output:audit && npm run garden:backlog && npm run garden:catalog -- --check` |

## templates and prompts

- templates/prompts/new-content.md
- templates/prompts/project-checkin.md
- templates/prompts/project-link.md
- templates/prompts/publish-content.md
- templates/prompts/site-feature.md
- templates/prompts/update-content.md
- templates/project-checkin/AGENTS.project-checkin.md
- templates/content/build-log.mdx
- templates/content/entry.mdx
- templates/content/experiment.mdx
- templates/content/field-note.mdx
- templates/content/fragment.mdx
- templates/content/graveyard-note.mdx
- templates/content/pattern.mdx

## skills

- auto-moderation (committed) — garden/skills/auto-moderation/SKILL.md
- (local .agents/skills present, gitignored) (local-only) — .agents/skills

## workflows

- .github/workflows/archive-discussions-sync.yml
- .github/workflows/archive-intake-screener.yml
- .github/workflows/deploy-pages.yml

## docs

- docs/README.md
- docs/agent-project-updates.md
- docs/agent-workflow.md
- docs/archive-annotations-auto-moderation.md
- docs/archive-annotations-backend-decision.md
- docs/archive-annotations-data.md
- docs/archive-annotations-design-plan.md
- docs/archive-annotations-intake.md
- docs/archive-annotations-moderation-model.md
- docs/archive-annotations-phase-e-plan.md
- docs/archive-annotations-roadmap.md
- docs/archive-annotations-technical-plan.md
- docs/archive-style-guide.md
- docs/component-map.md
- docs/content-authoring.md
- docs/content-model.md
- docs/deploy.md
- docs/design-plan.md
- docs/operating-the-garden.md
- docs/privacy-and-public-repo.md
- docs/project-linking.md
- docs/thebolanarchives_website_theme_brief_backup.md
- docs/thebolanarchives_website_theme_brief_chosen.md
- docs/workspace-catalog.md
