import type { ArchiveAnnotation } from "@/lib/annotations";

type AnnotationNoteProps = {
  annotation: ArchiveAnnotation;
};

export function AnnotationNote({ annotation }: AnnotationNoteProps) {
  return (
    <article className="annotation-note" data-status={annotation.status}>
      <div className="annotation-note-meta">
        <p>{annotation.label}</p>
        <p>status: {annotation.status}</p>
      </div>

      {annotation.excerpt ? <blockquote>{annotation.excerpt}</blockquote> : null}

      <p>{annotation.body}</p>

      <footer>
        {annotation.author} / <time dateTime={annotation.created}>{annotation.created}</time>
      </footer>
    </article>
  );
}
