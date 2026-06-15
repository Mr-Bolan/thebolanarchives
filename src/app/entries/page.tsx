import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("entries");

export default function EntriesPage() {
  return <CollectionPage folder="entries" />;
}
