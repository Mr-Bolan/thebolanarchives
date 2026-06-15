import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import type { ArchiveItem } from "@/lib/content";
import { slugifyHeading, textFromChildren } from "@/lib/headings";
import { ArchiveMetaCard } from "@/components/archive/ArchiveMetaCard";
import { RelatedArtifacts } from "@/components/archive/RelatedArtifacts";
import { ExperimentFrame } from "@/components/experiments/ExperimentFrame";
import { CodeBlock } from "@/components/writing/CodeBlock";
import { DiagramBlock } from "@/components/writing/DiagramBlock";
import { OpenQuestions } from "@/components/writing/OpenQuestions";
import { SideNote } from "@/components/writing/SideNote";
import { TerminalBlock } from "@/components/writing/TerminalBlock";

type MdxRendererProps = {
  item: ArchiveItem;
  relatedItems: ArchiveItem[];
  source: string;
};

export async function MdxRenderer({ item, relatedItems, source }: MdxRendererProps) {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    baseUrl: import.meta.url,
    development: false,
  });
  const headingCounts = new Map<string, number>();

  const components: MDXComponents = {
    ArchiveMetaCard: ({ compact }: { compact?: boolean }) => <ArchiveMetaCard compact={compact} item={item} />,
    RelatedArtifacts: ({ heading }: { heading?: string }) => (
      <RelatedArtifacts heading={heading} items={relatedItems} />
    ),
    OpenQuestions,
    CodeBlock,
    TerminalBlock,
    DiagramBlock,
    SideNote,
    ExperimentFrame,
    h2: ({ children }) => <AnchoredHeading level={2} counts={headingCounts}>{children}</AnchoredHeading>,
    h3: ({ children }) => <AnchoredHeading level={3} counts={headingCounts}>{children}</AnchoredHeading>,
    h4: ({ children }) => <AnchoredHeading level={4} counts={headingCounts}>{children}</AnchoredHeading>,
    pre: CodeBlock,
  };

  return <MDXContent components={components} />;
}

function AnchoredHeading({
  children,
  counts,
  level,
}: {
  children: ReactNode;
  counts: Map<string, number>;
  level: 2 | 3 | 4;
}) {
  const text = textFromChildren(children);
  const id = slugifyHeading(text, counts);
  const content = (
    <>
      <a aria-label={`link to ${text}`} href={`#${id}`}>
        #
      </a>
      <span>{children}</span>
    </>
  );

  if (level === 2) {
    return <h2 className="mdx-heading" id={id}>{content}</h2>;
  }

  if (level === 3) {
    return <h3 className="mdx-heading" id={id}>{content}</h3>;
  }

  return <h4 className="mdx-heading" id={id}>{content}</h4>;
}
