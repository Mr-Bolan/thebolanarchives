import { Suspense } from "react";
import { ArchiveGraph } from "@/components/experiments/ArchiveGraph";
import { getArchiveGraph } from "@/lib/graph";

export const dynamic = "force-static";

export const metadata = {
  title: "garden / thebolanarchives",
  description:
    "The Blackbox Garden: a map of the archive as connected records and tags — what links to what, and where ideas cluster.",
};

export default function GardenPage() {
  const graph = getArchiveGraph();

  return (
    <div className="page garden-page">
      <header className="page-header">
        <p className="kicker">map / the blackbox garden</p>
        <h1>the garden</h1>
        <p className="lede">
          the archive as a living map. each record is a node; lines are explicit links,
          shared tags, and series. clusters show where the systems grow together.
        </p>
      </header>

      <Suspense fallback={<p className="garden-loading">drawing the garden…</p>}>
        <ArchiveGraph graph={graph} />
      </Suspense>
    </div>
  );
}
