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
    githubIntakeUrl,
    mockAnnotationsByAnchor,
    nearAnchorId,
    recordSlug,
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
          githubIntakeUrl={githubIntakeUrl}
          recordSlug={recordSlug}
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
  githubIntakeUrl,
  recordSlug,
  submitMockNote,
}: {
  anchorId: string;
  anchorLabel: string;
  cancelComposer: () => void;
  githubIntakeUrl: string;
  recordSlug: string;
  submitMockNote: (input: { anchorId: string; anchorLabel: string; author: string; body: string; sourceUrl: string }) => void;
}) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = `annotation-composer-${anchorId}`;
  const handoffUrl = discussionHandoffUrl({ anchorId, anchorLabel, author, body, githubIntakeUrl, recordSlug });

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

    submitMockNote({ anchorId, anchorLabel, author, body, sourceUrl: handoffUrl });
  }

  async function handleCopyPreparedNote() {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setError("write a note body before copying this handoff.");
      bodyRef.current?.focus();
      return;
    }

    const preparedNote = [
      "target record slug:",
      recordSlug,
      "",
      "target anchor ID:",
      anchorId,
      "",
      "short excerpt:",
      "",
      "",
      "note body:",
      trimmedBody,
      "",
      "display name / pseudonym:",
      author.trim() || "anonymous reader",
      "",
      "GitHub intake draft:",
      handoffUrl,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(preparedNote);
      setCopyStatus("prepared note copied. paste it into the GitHub intake form.");
      setError("");
    } catch {
      setError("clipboard copy failed. copy the fields manually before opening GitHub.");
    }
  }

  return (
    <form
      className="annotation-composer"
      aria-label={`draft intake note composer for ${anchorLabel}`}
      onSubmit={handleSubmit}
    >
      <p className="annotation-composer-selected">
        selected anchor: <strong>{anchorLabel}</strong>
      </p>
      <p className="annotation-composer-warning">
        This prepares a public GitHub intake note. If you submit it on GitHub, the discussion and your GitHub username will be visible.
      </p>
      <p className="annotation-composer-warning">
        After posting, the note may be auto-screened and triaged. It appears on the archive only after review.
      </p>
      <p className="annotation-composer-hint">
        Local preview is only a draft preview, not publication. This page has no token, GitHub API write, or network write.
      </p>

      <label htmlFor={`${fieldId}-author`}>
        display name <span>optional for archive review; GitHub username stays public on GitHub</span>
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
          setCopyStatus("");
        }}
      />
      <p className="annotation-composer-hint" id={`${fieldId}-hint`}>
        local previews are draft/pending and disappear when this page session ends.
      </p>
      {copyStatus ? (
        <p className="annotation-composer-copy-status" role="status">
          {copyStatus}
        </p>
      ) : null}
      {error ? (
        <p className="annotation-composer-error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      ) : null}

      <div className="annotation-composer-actions annotation-composer-handoff">
        <button type="button" onClick={handleCopyPreparedNote}>
          copy prepared note
        </button>
        <a href={handoffUrl} target="_blank" rel="noreferrer">
          open prefilled GitHub intake
        </a>
      </div>

      <div className="annotation-composer-actions">
        <button type="button" onClick={cancelComposer}>
          cancel
        </button>
        <button type="submit">stage mock preview</button>
      </div>
    </form>
  );
}

function discussionHandoffUrl({
  anchorId,
  anchorLabel,
  author,
  body,
  githubIntakeUrl,
  recordSlug,
}: {
  anchorId: string;
  anchorLabel: string;
  author: string;
  body: string;
  githubIntakeUrl: string;
  recordSlug: string;
}) {
  const url = new URL(githubIntakeUrl);

  url.searchParams.set("title", `[annotation] ${recordSlug} / ${anchorId}`);
  url.searchParams.set("target-record-slug", recordSlug);
  url.searchParams.set("target-anchor-id", anchorId);
  url.searchParams.set("short-excerpt", anchorLabel);

  if (body.trim()) {
    url.searchParams.set("note-body", body.trim());
  }

  if (author.trim()) {
    url.searchParams.set("display-name", author.trim());
  }

  return url.toString();
}
