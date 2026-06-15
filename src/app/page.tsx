import { getRecentContent } from "@/lib/content";
import { ArchiveCard } from "@/components/archive/ArchiveCard";

export const dynamic = "force-static";

export default function HomePage() {
  const records = getRecentContent(4);

  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <p className="kicker">anonymous archive / blackbox garden</p>
        <h1 id="home-title">thebolanarchives</h1>
        <p className="lede">A private index of public experiments.</p>
        <p>Things built. Things broken. Things understood later.</p>
      </section>

      <section className="archive-section" aria-labelledby="recent-records">
        <p className="section-label">recent records</p>
        <h2 id="recent-records">first shelf</h2>
        {records.length === 0 ? (
          <p className="empty-state">no published records yet.</p>
        ) : (
          <ol className="record-list">
            {records.map((record) => (
              <li key={record.slug}>
                <ArchiveCard item={record} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
