import type { RenderedArchiveAnnotation } from "@/lib/annotations";

type AnnotationNoteProps = {
  annotation: RenderedArchiveAnnotation;
};

export function AnnotationNote({ annotation }: AnnotationNoteProps) {
  const isMock = "mock" in annotation;

  return (
    <article className="annotation-note" data-mock={isMock ? "true" : "false"} data-status={annotation.status}>
      <div className="annotation-note-meta">
        <p>{annotation.label}</p>
        <p>status: {annotation.status}</p>
      </div>

      {annotation.excerpt ? <blockquote>{annotation.excerpt}</blockquote> : null}

      <p>{annotation.body}</p>

      {isMock ? <p className="annotation-note-session">target: {annotation.recordSlug} / {annotation.anchorId}</p> : null}
      {annotation.sourceUrl ? (
        <p className="annotation-note-session">
          <a href={annotation.sourceUrl} target="_blank" rel="noreferrer">
            {isMock ? "open prepared GitHub intake" : "source discussion"}
          </a>
        </p>
      ) : null}
      {isMock ? <p className="annotation-note-session">mock adapter / session only / not published</p> : null}

      <footer>
        {annotation.author} / <time dateTime={annotation.created}>{annotation.created}</time>
      </footer>
    </article>
  );
}
