import type { Metadata } from "next";
import { ContentDetailPage } from "@/components/archive/ContentDetailPage";
import { getStaticParamsForCollection } from "@/lib/content";
import { getContentMetadata } from "@/lib/page-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticParamsForCollection("entries");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getContentMetadata("entries", slug);
}

export default async function EntryPage({ params }: PageProps) {
  const { slug } = await params;
  return <ContentDetailPage folder="entries" slug={slug} />;
}
