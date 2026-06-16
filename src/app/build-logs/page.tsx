import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("build-logs");

export default function BuildLogsPage() {
  return (
    <>
      <CollectionPage folder="build-logs" />
      <ProjectLedger projects={getProjectLedger()} />
    </>
  );
}

type ProjectLedgerItem = {
  title: string;
  slug: string;
  status: string;
  updated: string;
  route: string;
  current_state: string;
  next_move?: string;
};

function ProjectLedger({ projects }: { projects: ProjectLedgerItem[] }) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="archive-section" aria-labelledby="project-ledger-title">
      <p className="section-label">project ledger</p>
      <h2 id="project-ledger-title">current project state</h2>
      <ol className="record-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <article className="record" data-variant="row">
              <p className="record-meta">
                {project.status} / updated {project.updated}
              </p>
              <h3>
                <Link href={project.route}>{project.title}</Link>
              </h3>
              <p>{project.current_state}</p>
              {project.next_move ? <p>next: {project.next_move}</p> : null}
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function getProjectLedger(): ProjectLedgerItem[] {
  const ledgerPath = path.join(process.cwd(), "public", "project-ledger.json");

  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const data = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));

  return Array.isArray(data) ? data.filter(isProjectLedgerItem) : [];
}

function isProjectLedgerItem(value: unknown): value is ProjectLedgerItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return ["title", "slug", "status", "updated", "route", "current_state"].every((key) => typeof item[key] === "string");
}
