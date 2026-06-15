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
};

export const archiveAnnotations: ArchiveAnnotation[] = [
  {
    id: "reader_note_001",
    recordSlug: "why-this-exists",
    anchorId: "p-1",
    label: "reader note",
    body: "This static note marks the archive premise without turning the page into a comment thread.",
    author: "anonymous reader",
    created: "2026-06-15",
    status: "approved",
    excerpt: "This archive is not a portfolio.",
  },
  {
    id: "annotation_005",
    recordSlug: "why-this-exists",
    anchorId: "p-1",
    label: "annotation",
    body: "A second static note on the same anchor proves the stack/count behavior without adding replies or reactions.",
    author: "anonymous reader",
    created: "2026-06-15",
    status: "approved",
  },
  {
    id: "field_comment_002",
    recordSlug: "why-this-exists",
    anchorId: "why-it-exists",
    label: "field comment",
    body: "The strongest anchor here is the reason for writing things down: memory is not an archive.",
    author: "archive maintainer",
    created: "2026-06-15",
    status: "approved",
  },
  {
    id: "annotation_003",
    recordSlug: "the-operator-knows-before-the-database-does",
    anchorId: "what-i-noticed",
    label: "annotation",
    body: "This is the useful edge of the record: informal observation can become evidence when it is handled honestly.",
    author: "anonymous reader",
    created: "2026-06-15",
    status: "approved",
  },
  {
    id: "reader_note_004",
    recordSlug: "the-operator-knows-before-the-database-does",
    anchorId: "p-2",
    label: "reader note",
    body: "A future live system would need moderation here. Phase A keeps this as sanitized source data only.",
    author: "archive maintainer",
    created: "2026-06-15",
    status: "archived",
    excerpt: "The operator usually knows something is wrong before the database does.",
  },
];

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
