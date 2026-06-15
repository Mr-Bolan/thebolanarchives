import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("experiments");

export default function ExperimentsPage() {
  return <CollectionPage folder="experiments" />;
}
