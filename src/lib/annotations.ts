import fs from "node:fs";
import path from "node:path";

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

const annotationsRoot = path.join(process.cwd(), "content", "annotations");

export const archiveAnnotations: ArchiveAnnotation[] = readArchiveAnnotations();

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

function readArchiveAnnotations(): ArchiveAnnotation[] {
  if (!fs.existsSync(annotationsRoot)) {
    return [];
  }

  return fs
    .readdirSync(annotationsRoot)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .flatMap((file) => {
      const filePath = path.join(annotationsRoot, file);
      const data: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (!Array.isArray(data)) {
        throw new Error(`${filePath}: annotation file must be a JSON array`);
      }

      return data as ArchiveAnnotation[];
    });
}
