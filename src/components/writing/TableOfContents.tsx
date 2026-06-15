import type { TocHeading } from "@/lib/headings";

type TableOfContentsProps = {
  headings?: TocHeading[];
};

export function TableOfContents({ headings = [] }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-labelledby="table-of-contents-title" className="table-of-contents">
      <p className="section-label">record map</p>
      <h2 id="table-of-contents-title">contents</h2>
      <ol>
        {headings.map((heading) => (
          <li data-level={heading.level} key={heading.id}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
