import type { Metadata } from "next";
import type { CollectionFolder } from "@/lib/content";
import { COLLECTIONS, getContentByFolderAndSlug } from "@/lib/content";

export function getCollectionMetadata(folder: CollectionFolder): Metadata {
  const collection = COLLECTIONS[folder];

  return {
    title: `${collection.label} / thebolanarchives`,
    description: collection.description,
  };
}

export function getContentMetadata(folder: CollectionFolder, slug: string): Metadata {
  const item = getContentByFolderAndSlug(folder, slug);

  if (!item) {
    return {
      title: "record not found / thebolanarchives",
    };
  }

  const metadata: Metadata = {
    title: `${item.title} / thebolanarchives`,
    description: item.summary,
  };

  if (item.visibility === "unlisted") {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
