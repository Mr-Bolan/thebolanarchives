import { notFound } from "next/navigation";
import type { CollectionFolder, ExternalLink } from "@/lib/content";
import { getContentByFolderAndSlug, getRelatedContent } from "@/lib/content";
import { getAnnotationsForRecord } from "@/lib/annotations";
import { getMarkdownHeadings } from "@/lib/headings";
import { ArchiveMetaCard } from "@/components/archive/ArchiveMetaCard";
import { ArchiveAnnotations } from "@/components/annotations/ArchiveAnnotations";
import { RelatedArtifacts } from "@/components/archive/RelatedArtifacts";
import { MdxRenderer } from "@/components/writing/MdxRenderer";
import { TableOfContents } from "@/components/writing/TableOfContents";

type ContentDetailPageProps = {
  folder: CollectionFolder;
  slug: string;
};

export async function ContentDetailPage({ folder, slug }: ContentDetailPageProps) {
  const item = getContentByFolderAndSlug(folder, slug);

  if (!item) {
    notFound();
  }

  const relatedItems = getRelatedContent(item);
  const annotations = getAnnotationsForRecord(item.slug);
  const body = stripLeadingHeading(item.body);
  const headings = getMarkdownHeadings(body);

  return (
    <article className="content-page">
      <header className="page-header content-header">
        <p className="kicker">
          {item.record_id ?? item.type} / {item.type}
        </p>
        <h1>{item.title}</h1>
        <p className="lede">{item.summary}</p>
      </header>

      <div className="content-main">
        <ArchiveMetaCard item={item} />
        <TableOfContents headings={headings} />

        {annotations.length > 0 ? (
          <ArchiveAnnotations annotations={annotations} recordTitle={item.title}>
            <div className="mdx-body">
              <MdxRenderer
                annotations={annotations}
                item={item}
                relatedItems={relatedItems}
                source={body}
              />
            </div>
          </ArchiveAnnotations>
        ) : (
          <div className="mdx-body">
            <MdxRenderer item={item} relatedItems={relatedItems} source={body} />
          </div>
        )}

        <ExternalLinks links={item.external_links} />
        <RelatedArtifacts items={relatedItems} />
      </div>
    </article>
  );
}

function ExternalLinks({ links }: { links?: ExternalLink[] }) {
  if (!links?.length) {
    return null;
  }

  return (
    <section className="related-artifacts" aria-labelledby="external-links-title">
      <p className="section-label">outside references</p>
      <h2 id="external-links-title">external links</h2>
      <ol className="record-list related-list">
        {links.map((link) => (
          <li key={`${link.kind}-${link.url}`}>
            <article className="record" data-variant="compact">
              <p className="record-meta">{link.kind}</p>
              <h3>
                <a href={link.url} rel="noreferrer" target="_blank">
                  {link.label}
                </a>
              </h3>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function stripLeadingHeading(source: string): string {
  return source.replace(/^#\s+.*(?:\r?\n)+/, "").trim();
}
