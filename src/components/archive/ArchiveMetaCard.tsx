import type { ArchiveItem } from "@/lib/content";
import { ConfidenceBadge } from "@/components/archive/ConfidenceBadge";
import { StatusBadge } from "@/components/archive/StatusBadge";
import { TagList, tagGardenHref } from "@/components/archive/TagList";

type ArchiveMetaCardProps = {
  item: ArchiveItem;
  compact?: boolean;
};

export function ArchiveMetaCard({ item, compact = false }: ArchiveMetaCardProps) {
  return (
    <aside className="archive-meta-card" aria-label={`${item.title} metadata`}>
      <dl>
        <div>
          <dt>record</dt>
          <dd>{item.record_id ?? item.slug}</dd>
        </div>
        <div>
          <dt>type</dt>
          <dd>{item.type}</dd>
        </div>
        <div>
          <dt>origin</dt>
          <dd>{item.narrative_origin}</dd>
        </div>
        <div>
          <dt>created</dt>
          <dd>{item.created}</dd>
        </div>
        <div>
          <dt>updated</dt>
          <dd>{item.updated}</dd>
        </div>
        <div>
          <dt>visibility</dt>
          <dd>{item.visibility}</dd>
        </div>
        {item.last_verified ? (
          <div>
            <dt>verified</dt>
            <dd>{item.last_verified}</dd>
          </div>
        ) : null}
        {item.source_context ? (
          <div>
            <dt>source</dt>
            <dd>{item.source_context}</dd>
          </div>
        ) : null}
      </dl>
      <div className="badge-row">
        <StatusBadge status={item.status} />
        <ConfidenceBadge confidence={item.confidence} />
      </div>
      {compact ? null : (
        <>
          <TagList items={item.tags} label={`${item.title} tags`} hrefFor={tagGardenHref} />
          <TagList items={item.tools} label={`${item.title} tools`} />
        </>
      )}
    </aside>
  );
}
