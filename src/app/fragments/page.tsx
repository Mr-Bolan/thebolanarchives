import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("fragments");

export default function FragmentsPage() {
  return <CollectionPage folder="fragments" />;
}
