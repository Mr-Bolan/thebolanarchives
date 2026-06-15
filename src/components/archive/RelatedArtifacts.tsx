import type { ArchiveItem } from "@/lib/content";
import { ArchiveCard } from "@/components/archive/ArchiveCard";

type RelatedArtifactsProps = {
  items?: ArchiveItem[];
  heading?: string;
};

export function RelatedArtifacts({ items = [], heading = "related artefacts" }: RelatedArtifactsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="related-artifacts" aria-labelledby="related-artifacts-title">
      <p className="section-label">cross references</p>
      <h2 id="related-artifacts-title">{heading}</h2>
      <ol className="record-list related-list">
        {items.map((item) => (
          <li key={item.slug}>
            <ArchiveCard item={item} variant="compact" />
          </li>
        ))}
      </ol>
    </section>
  );
}
