import discussionRegistry from "../../content/annotation-discussions.json";

export type AnnotationDiscussion = {
  discussionId?: string;
  number: number;
  url: string;
  title: string;
  categorySlug: string;
};

type AnnotationDiscussionRegistry = {
  version: 1;
  repository: string;
  categorySlug: string;
  records: Record<string, AnnotationDiscussion>;
};

const registry = discussionRegistry as AnnotationDiscussionRegistry;

export const annotationDiscussionRepository = registry.repository || "Mr-Bolan/thebolanarchives";
export const annotationDiscussionCategorySlug = registry.categorySlug || "archive-annotations";

export const defaultAnnotationDiscussionUrl = `https://github.com/${annotationDiscussionRepository}/discussions/new?category=${annotationDiscussionCategorySlug}`;

export function getAnnotationDiscussionForRecord(recordSlug: string): AnnotationDiscussion | undefined {
  return registry.records[recordSlug];
}
