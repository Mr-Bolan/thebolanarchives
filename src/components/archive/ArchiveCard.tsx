import Link from "next/link";
import type { ArchiveItem } from "@/lib/content";
import { ConfidenceBadge } from "@/components/archive/ConfidenceBadge";
import { StatusBadge } from "@/components/archive/StatusBadge";
import { TagList, tagGardenHref } from "@/components/archive/TagList";

type ArchiveCardProps = {
  item: ArchiveItem;
  variant?: "default" | "compact" | "row";
};

export function ArchiveCard({ item, variant = "default" }: ArchiveCardProps) {
  return (
    <article className="record" data-variant={variant}>
      <p className="record-meta">
        {item.record_id ?? item.type} / {item.type} / {item.created}
      </p>
      <h3>
        <Link href={item.route}>{item.title}</Link>
      </h3>
      {variant === "compact" ? null : <p>{item.summary}</p>}
      <div className="badge-row">
        <StatusBadge status={item.status} />
        <ConfidenceBadge confidence={item.confidence} />
      </div>
      <TagList items={item.tags} label={`${item.title} tags`} limit={variant === "row" ? 3 : undefined} hrefFor={tagGardenHref} />
    </article>
  );
}
