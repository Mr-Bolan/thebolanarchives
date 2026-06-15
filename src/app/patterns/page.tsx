import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("patterns");

export default function PatternsPage() {
  return <CollectionPage folder="patterns" />;
}
