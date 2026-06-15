import { ArchiveIndex } from "@/components/archive/ArchiveIndex";
import { getAllArchiveItems } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = {
  title: "index / thebolanarchives",
  description: "A filterable static inventory of public archive records.",
};

export default function IndexPage() {
  const items = getAllArchiveItems();

  return <ArchiveIndex items={items} />;
}
