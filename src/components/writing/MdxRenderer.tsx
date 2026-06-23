import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import type { ArchiveAnnotation } from "@/lib/annotations";
import { getAnnotationsByAnchor } from "@/lib/annotations";
import type { ArchiveItem } from "@/lib/content";
import { slugifyHeading, textFromChildren } from "@/lib/headings";
import { AnnotationAnchor } from "@/components/annotations/AnnotationAnchor";
import { ArchiveMetaCard } from "@/components/archive/ArchiveMetaCard";
import { RelatedArtifacts } from "@/components/archive/RelatedArtifacts";
import { sharedMdxComponents } from "@/components/writing/sharedMdxComponents";

type MdxRendererProps = {
  annotations?: ArchiveAnnotation[];
  item: ArchiveItem;
  relatedItems: ArchiveItem[];
  source: string;
};

export async function MdxRenderer({ annotations = [], item, relatedItems, source }: MdxRendererProps) {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    baseUrl: import.meta.url,
    development: false,
  });
  const headingCounts = new Map<string, number>();
  const annotationsByAnchor = getAnnotationsByAnchor(annotations);
  let paragraphCount = 0;

  const components: MDXComponents = {
    ...sharedMdxComponents,
    ArchiveMetaCard: ({ compact }: { compact?: boolean }) => <ArchiveMetaCard compact={compact} item={item} />,
    RelatedArtifacts: ({ heading }: { heading?: string }) => (
      <RelatedArtifacts heading={heading} items={relatedItems} />
    ),
    h2: ({ children }) => (
      <AnchoredHeading annotationsByAnchor={annotationsByAnchor} counts={headingCounts} level={2}>
        {children}
      </AnchoredHeading>
    ),
    h3: ({ children }) => (
      <AnchoredHeading annotationsByAnchor={annotationsByAnchor} counts={headingCounts} level={3}>
        {children}
      </AnchoredHeading>
    ),
    h4: ({ children }) => (
      <AnchoredHeading annotationsByAnchor={annotationsByAnchor} counts={headingCounts} level={4}>
        {children}
      </AnchoredHeading>
    ),
    p: ({ children }) => {
      paragraphCount += 1;
      const anchorId = `p-${paragraphCount}`;
      const anchorAnnotations = annotationsByAnchor.get(anchorId) ?? [];

      return (
        <AnnotationAnchor
          anchorId={anchorId}
          anchorLabel={`paragraph ${paragraphCount}`}
          annotations={anchorAnnotations}
          as="p"
        >
          {children}
        </AnnotationAnchor>
      );
    },
  };

  return <MDXContent components={components} />;
}

function AnchoredHeading({
  annotationsByAnchor,
  children,
  counts,
  level,
}: {
  annotationsByAnchor: Map<string, ArchiveAnnotation[]>;
  children: ReactNode;
  counts: Map<string, number>;
  level: 2 | 3 | 4;
}) {
  const text = textFromChildren(children);
  const id = slugifyHeading(text, counts);
  const annotations = annotationsByAnchor.get(id) ?? [];
  const content = (
    <>
      <a aria-label={`link to ${text}`} href={`#${id}`}>
        #
      </a>
      <span>{children}</span>
    </>
  );

  return (
    <AnnotationAnchor
      anchorId={id}
      anchorLabel={`section ${text}`}
      annotations={annotations}
      as={`h${level}` as "h2" | "h3" | "h4"}
      className="mdx-heading"
    >
      {content}
    </AnnotationAnchor>
  );
}
