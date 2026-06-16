"use client";

import type { ReactNode } from "react";
import type { ArchiveAnnotation } from "@/lib/annotations";
import { AnnotationMarker } from "@/components/annotations/AnnotationMarker";
import { AnnotationNote } from "@/components/annotations/AnnotationNote";
import { useAnnotationLayer } from "@/components/annotations/ArchiveAnnotations";

type AnnotationAnchorProps = {
  anchorId: string;
  anchorLabel: string;
  annotations: ArchiveAnnotation[];
  as: "p" | "h2" | "h3" | "h4";
  children: ReactNode;
  className?: string;
};

export function AnnotationAnchor({
  anchorId,
  anchorLabel,
  annotations,
  as,
  children,
  className,
}: AnnotationAnchorProps) {
  const { activeAnchorId, nearAnchorId, toggleAnchor, visible } = useAnnotationLayer();
  const Tag = as;
  const isOpen = visible && activeAnchorId === anchorId;
  const isNear = nearAnchorId === anchorId;
  const stackId = `annotation-stack-${anchorId}`;

  if (annotations.length === 0) {
    return (
      <Tag className={className} id={anchorId}>
        {children}
      </Tag>
    );
  }

  return (
    <div
      className="annotation-anchor"
      data-anchor-kind={as === "p" ? "paragraph" : "heading"}
      data-anchor-id={anchorId}
      data-near={isNear ? "true" : "false"}
      data-open={isOpen ? "true" : "false"}
    >
      <Tag className={className} id={anchorId}>
        {children}
      </Tag>

      <AnnotationMarker
        anchorLabel={anchorLabel}
        controlsId={stackId}
        count={annotations.length}
        isOpen={isOpen}
        onToggle={() => toggleAnchor(anchorId)}
      />

      <ol className="annotation-note-stack annotation-enhanced-stack" hidden={!isOpen} id={stackId}>
        {annotations.map((annotation) => (
          <li key={annotation.id}>
            <AnnotationNote annotation={annotation} />
          </li>
        ))}
      </ol>

      <details className="annotation-nojs-fallback">
        <summary>{annotations.length === 1 ? "1 annotation" : `${annotations.length} annotations`}</summary>
        <ol>
          {annotations.map((annotation) => (
            <li key={annotation.id}>
              <AnnotationNote annotation={annotation} />
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
