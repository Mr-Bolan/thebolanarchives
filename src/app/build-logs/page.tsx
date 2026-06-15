import { CollectionPage } from "@/components/archive/CollectionPage";
import { getCollectionMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const metadata = getCollectionMetadata("build-logs");

export default function BuildLogsPage() {
  return <CollectionPage folder="build-logs" />;
}
