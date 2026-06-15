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
  return getStaticParamsForCollection("field-notes");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getContentMetadata("field-notes", slug);
}

export default async function FieldNotePage({ params }: PageProps) {
  const { slug } = await params;
  return <ContentDetailPage folder="field-notes" slug={slug} />;
}
