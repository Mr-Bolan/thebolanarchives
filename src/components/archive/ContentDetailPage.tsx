import { notFound } from "next/navigation";
import type { CollectionFolder } from "@/lib/content";
import { getContentByFolderAndSlug, getRelatedContent } from "@/lib/content";
import { getMarkdownHeadings } from "@/lib/headings";
import { ArchiveMetaCard } from "@/components/archive/ArchiveMetaCard";
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

        <div className="mdx-body">
          <MdxRenderer item={item} relatedItems={relatedItems} source={body} />
        </div>

        <RelatedArtifacts items={relatedItems} />
      </div>
    </article>
  );
}

function stripLeadingHeading(source: string): string {
  return source.replace(/^#\s+.*(?:\r?\n)+/, "").trim();
}
