"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
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
  const {
    activeAnchorId,
    addMode,
    cancelComposer,
    composerAnchorId,
    mockAnnotationsByAnchor,
    nearAnchorId,
    selectComposerAnchor,
    submitMockNote,
    toggleAnchor,
    visible,
  } = useAnnotationLayer();
  const Tag = as;
  const mockAnnotations = mockAnnotationsByAnchor.get(anchorId) ?? [];
  const renderedAnnotations = [...annotations, ...mockAnnotations];
  const hasAnnotations = renderedAnnotations.length > 0;
  const isComposerOpen = composerAnchorId === anchorId;
  const isOpen = visible && activeAnchorId === anchorId;
  const isNear = nearAnchorId === anchorId;
  const stackId = `annotation-stack-${anchorId}`;

  if (!hasAnnotations && !addMode && !isComposerOpen) {
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

      {hasAnnotations ? (
        <AnnotationMarker
          anchorLabel={anchorLabel}
          controlsId={stackId}
          count={renderedAnnotations.length}
          isOpen={isOpen}
          onToggle={() => toggleAnchor(anchorId)}
        />
      ) : null}

      {addMode ? (
        <button
          type="button"
          className="annotation-select-anchor"
          data-annotation-select-anchor
          onClick={() => selectComposerAnchor(anchorId, anchorLabel)}
        >
          mark this passage <span>{anchorLabel}</span>
        </button>
      ) : null}

      {isComposerOpen ? (
        <AnnotationComposer
          anchorId={anchorId}
          anchorLabel={anchorLabel}
          cancelComposer={cancelComposer}
          submitMockNote={submitMockNote}
        />
      ) : null}

      {hasAnnotations ? (
        <ol className="annotation-note-stack annotation-enhanced-stack" hidden={!isOpen} id={stackId}>
          {renderedAnnotations.map((annotation) => (
            <li key={annotation.id}>
              <AnnotationNote annotation={annotation} />
            </li>
          ))}
        </ol>
      ) : null}

      {hasAnnotations ? (
        <details className="annotation-nojs-fallback">
          <summary>{renderedAnnotations.length === 1 ? "1 annotation" : `${renderedAnnotations.length} annotations`}</summary>
          <ol>
            {renderedAnnotations.map((annotation) => (
              <li key={annotation.id}>
                <AnnotationNote annotation={annotation} />
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}

function AnnotationComposer({
  anchorId,
  anchorLabel,
  cancelComposer,
  submitMockNote,
}: {
  anchorId: string;
  anchorLabel: string;
  cancelComposer: () => void;
  submitMockNote: (input: { anchorId: string; anchorLabel: string; author: string; body: string }) => void;
}) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = `annotation-composer-${anchorId}`;

  useEffect(() => {
    bodyRef.current?.focus();
  }, [anchorId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!body.trim()) {
      setError("write a note body before staging this trace.");
      bodyRef.current?.focus();
      return;
    }

    submitMockNote({ anchorId, anchorLabel, author, body });
  }

  return (
    <form
      className="annotation-composer"
      aria-label={`mock note composer for ${anchorLabel}`}
      onSubmit={handleSubmit}
    >
      <p className="annotation-composer-selected">
        selected anchor: <strong>{anchorLabel}</strong>
      </p>
      <p className="annotation-composer-warning">
        mock adapter: this stays in memory for this page session and is not published.
      </p>

      <label htmlFor={`${fieldId}-author`}>
        pseudonym <span>optional; blank stays anonymous</span>
      </label>
      <input
        id={`${fieldId}-author`}
        autoComplete="nickname"
        value={author}
        onChange={(event) => setAuthor(event.target.value)}
        placeholder="anonymous reader"
      />

      <label htmlFor={`${fieldId}-body`}>
        note body <span>required</span>
      </label>
      <textarea
        id={`${fieldId}-body`}
        ref={bodyRef}
        aria-describedby={error ? `${fieldId}-error` : `${fieldId}-hint`}
        rows={4}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setError("");
        }}
      />
      <p className="annotation-composer-hint" id={`${fieldId}-hint`}>
        staged notes are mock/pending and disappear when this page session ends.
      </p>
      {error ? (
        <p className="annotation-composer-error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      ) : null}

      <div className="annotation-composer-actions">
        <button type="button" onClick={cancelComposer}>
          cancel
        </button>
        <button type="submit">submit mock note</button>
      </div>
    </form>
  );
}
