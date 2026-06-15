import type { CollectionFolder } from "@/lib/content";
import { COLLECTIONS, getCollectionArchiveItems } from "@/lib/content";
import { ArchiveCard } from "@/components/archive/ArchiveCard";

type CollectionPageProps = {
  folder: CollectionFolder;
};

export function CollectionPage({ folder }: CollectionPageProps) {
  const collection = COLLECTIONS[folder];
  const records = getCollectionArchiveItems(folder);

  return (
    <section className="collection-page" aria-labelledby={`${folder}-title`}>
      <header className="page-header">
        <p className="kicker">{collection.type} collection</p>
        <h1 id={`${folder}-title`}>{collection.label}</h1>
        <p className="lede">{collection.description}</p>
        <p className="result-count">{records.length} records</p>
      </header>

      {records.length === 0 ? (
        <p className="empty-state">no records in this collection yet.</p>
      ) : (
        <ol className="record-list collection-list">
          {records.map((record) => (
            <li key={record.slug}>
              <ArchiveCard item={record} variant="row" />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
