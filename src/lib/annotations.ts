import operatorAnnotations from "../../content/annotations/the-operator-knows-before-the-database-does.json";
import whyThisExistsAnnotations from "../../content/annotations/why-this-exists.json";

export type ArchiveAnnotation = {
  id: string;
  recordSlug: string;
  anchorId: string;
  label: "reader note" | "field comment" | "annotation";
  body: string;
  author: "anonymous reader" | string;
  created: string;
  status: "approved" | "archived";
  excerpt?: string;
  sourceUrl?: string;
};

export type MockArchiveAnnotation = Omit<ArchiveAnnotation, "label" | "status"> & {
  label: "field comment";
  mock: true;
  status: "mock pending";
};

export type RenderedArchiveAnnotation = ArchiveAnnotation | MockArchiveAnnotation;

export const archiveAnnotations: ArchiveAnnotation[] = [
  ...whyThisExistsAnnotations,
  ...operatorAnnotations,
] as ArchiveAnnotation[];

export function getAnnotationsForRecord(recordSlug: string): ArchiveAnnotation[] {
  return archiveAnnotations.filter((annotation) => annotation.recordSlug === recordSlug);
}

export function getAnnotationsByAnchor(annotations: ArchiveAnnotation[]): Map<string, ArchiveAnnotation[]> {
  const byAnchor = new Map<string, ArchiveAnnotation[]>();

  for (const annotation of annotations) {
    const existing = byAnchor.get(annotation.anchorId) ?? [];
    byAnchor.set(annotation.anchorId, [...existing, annotation]);
  }

  return byAnchor;
}
