import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("graveyard");

export default function GraveyardPage() {
  return <CollectionPage folder="graveyard" />;
}
