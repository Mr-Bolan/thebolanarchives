"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { ArchiveAnnotation, MockArchiveAnnotation } from "@/lib/annotations";

type MockNoteInput = {
  anchorId: string;
  anchorLabel: string;
  author: string;
  body: string;
  sourceUrl: string;
};

type AnnotationLayerContextValue = {
  activeAnchorId: string | null;
  addMode: boolean;
  composerAnchorId: string | null;
  cancelComposer: () => void;
  clearSubmissionStatus: () => void;
  githubDiscussionUrl: string | null;
  githubNewDiscussionUrl: string;
  mockAnnotationsByAnchor: Map<string, MockArchiveAnnotation[]>;
  nearAnchorId: string | null;
  recordSlug: string;
  selectComposerAnchor: (anchorId: string, anchorLabel: string) => void;
  submissionStatus: string | null;
  submitMockNote: (input: MockNoteInput) => void;
  toggleAnchor: (anchorId: string) => void;
  visible: boolean;
};

const AnnotationLayerContext = createContext<AnnotationLayerContextValue>({
  activeAnchorId: null,
  addMode: false,
  composerAnchorId: null,
  cancelComposer: () => undefined,
  clearSubmissionStatus: () => undefined,
  githubDiscussionUrl: null,
  githubNewDiscussionUrl: "https://github.com/Mr-Bolan/thebolanarchives/discussions/new?category=archive-annotations",
  mockAnnotationsByAnchor: new Map(),
  nearAnchorId: null,
  recordSlug: "",
  selectComposerAnchor: () => undefined,
  submissionStatus: null,
  submitMockNote: () => undefined,
  toggleAnchor: () => undefined,
  visible: false,
});

type ArchiveAnnotationsProps = {
  annotations: ArchiveAnnotation[];
  children: ReactNode;
  discussionUrl?: string;
  newDiscussionUrl: string;
  recordTitle: string;
  recordSlug: string;
};

export function ArchiveAnnotations({
  annotations,
  children,
  discussionUrl,
  newDiscussionUrl,
  recordTitle,
  recordSlug,
}: ArchiveAnnotationsProps) {
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [composerAnchorId, setComposerAnchorId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [lampEnabled, setLampEnabled] = useState(false);
  const [lampActive, setLampActive] = useState(false);
  const [mockAnnotations, setMockAnnotations] = useState<MockArchiveAnnotation[]>([]);
  const [nearAnchorId, setNearAnchorId] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const totalAnnotations = annotations.length + mockAnnotations.length;
  const githubDiscussionUrl = discussionUrl ?? null;

  useEffect(() => {
    if (!visible) {
      setActiveAnchorId(null);
    }
  }, [visible]);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateLamp = () => setLampEnabled(pointerQuery.matches && !motionQuery.matches);

    updateLamp();
    pointerQuery.addEventListener("change", updateLamp);
    motionQuery.addEventListener("change", updateLamp);

    return () => {
      pointerQuery.removeEventListener("change", updateLamp);
      motionQuery.removeEventListener("change", updateLamp);
    };
  }, []);

  useEffect(() => {
    if (!lampEnabled) {
      setLampActive(false);
      setNearAnchorId(null);
    }
  }, [lampEnabled]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (composerAnchorId) {
          setComposerAnchorId(null);
          return;
        }

        if (addMode) {
          setAddMode(false);
          return;
        }

        setActiveAnchorId(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [addMode, composerAnchorId]);

  useEffect(() => {
    if (!addMode) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      shellRef.current?.querySelector<HTMLButtonElement>("[data-annotation-select-anchor]")?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [addMode]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!lampEnabled || event.pointerType === "touch") {
        return;
      }

      const shell = shellRef.current;
      if (!shell) {
        return;
      }

      const shellRect = shell.getBoundingClientRect();
      shell.style.setProperty("--lamp-x", `${event.clientX - shellRect.left}px`);
      shell.style.setProperty("--lamp-y", `${event.clientY - shellRect.top}px`);
      setLampActive(true);

      let nearestAnchorId: string | null = null;
      let nearestDistance = 190;

      for (const anchor of shell.querySelectorAll<HTMLElement>(".annotation-anchor")) {
        const rect = anchor.getBoundingClientRect();
        const x = Math.max(rect.left, Math.min(event.clientX, rect.right));
        const y = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
        const distance = Math.hypot(event.clientX - x, event.clientY - y);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestAnchorId = anchor.dataset.anchorId ?? null;
        }
      }

      setNearAnchorId((current) => (current === nearestAnchorId ? current : nearestAnchorId));
    },
    [lampEnabled],
  );

  const handlePointerLeave = useCallback(() => {
    setLampActive(false);
    setNearAnchorId(null);
  }, []);

  const mockAnnotationsByAnchor = useMemo(() => {
    const byAnchor = new Map<string, MockArchiveAnnotation[]>();

    for (const annotation of mockAnnotations) {
      const existing = byAnchor.get(annotation.anchorId) ?? [];
      byAnchor.set(annotation.anchorId, [...existing, annotation]);
    }

    return byAnchor;
  }, [mockAnnotations]);

  const cancelComposer = useCallback(() => {
    setComposerAnchorId(null);
  }, []);

  const clearSubmissionStatus = useCallback(() => {
    setSubmissionStatus(null);
  }, []);

  const selectComposerAnchor = useCallback((anchorId: string) => {
    setActiveAnchorId(anchorId);
    setComposerAnchorId(anchorId);
    setSubmissionStatus(null);
    setVisible(true);
  }, []);

  const submitMockNote = useCallback(
    ({ anchorId, anchorLabel, author, body, sourceUrl }: MockNoteInput) => {
      const trimmedBody = body.trim();

      if (!trimmedBody) {
        return;
      }

      const mockNote: MockArchiveAnnotation = {
        id: `mock_note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        recordSlug,
        anchorId,
        label: "field comment",
        body: trimmedBody,
        author: author.trim() || "anonymous reader",
        created: new Date().toISOString().slice(0, 10),
        sourceUrl,
        status: "mock pending",
        mock: true,
      };

      setMockAnnotations((current) => [...current, mockNote]);
      setActiveAnchorId(anchorId);
      setAddMode(false);
      setComposerAnchorId(null);
      setSubmissionStatus(`${anchorLabel}: local draft preview staged for this page session; not submitted or published.`);
      setVisible(true);
    },
    [recordSlug],
  );

  const toggleAnchor = useCallback((anchorId: string) => {
    setVisible(true);
    setComposerAnchorId(null);
    setActiveAnchorId((current) => (current === anchorId ? null : anchorId));
  }, []);

  const toggleAddMode = useCallback(() => {
    setAddMode((current) => !current);
    setActiveAnchorId(null);
    setComposerAnchorId(null);
    setSubmissionStatus(null);
    setVisible(true);
  }, []);

  const value = useMemo(
    () => ({
      activeAnchorId,
      addMode,
      cancelComposer,
      clearSubmissionStatus,
      composerAnchorId,
      githubDiscussionUrl,
      githubNewDiscussionUrl: newDiscussionUrl,
      mockAnnotationsByAnchor,
      nearAnchorId,
      recordSlug,
      selectComposerAnchor,
      submissionStatus,
      submitMockNote,
      toggleAnchor,
      visible,
    }),
    [
      activeAnchorId,
      addMode,
      cancelComposer,
      clearSubmissionStatus,
      composerAnchorId,
      githubDiscussionUrl,
      newDiscussionUrl,
      mockAnnotationsByAnchor,
      nearAnchorId,
      recordSlug,
      selectComposerAnchor,
      submissionStatus,
      submitMockNote,
      toggleAnchor,
      visible,
    ],
  );

  return (
    <AnnotationLayerContext.Provider value={value}>
      <section className="archive-annotations" aria-label={`annotations for ${recordTitle}`}>
        <div className="annotation-toolbar">
          <p className="section-label">archive annotations</p>
          <div className="annotation-toolbar-actions">
            <button
              type="button"
              className="annotation-toggle"
              aria-label={`inspection layer ${visible ? "open" : "sealed"}; toggle archive annotation layer`}
              aria-pressed={visible}
              onClick={() => setVisible((current) => !current)}
            >
              {visible ? "inspection layer: open" : `inspection layer: sealed (${totalAnnotations})`}
            </button>
            <button
              type="button"
              className="annotation-toggle annotation-add-toggle"
              aria-label={addMode ? "cancel add-note mode" : "enter add-note mode"}
              aria-pressed={addMode}
              onClick={toggleAddMode}
            >
              {addMode ? "add note mode: choose anchor" : "leave a trace"}
            </button>
          </div>
        </div>

        {submissionStatus ? (
          <div className="annotation-status" role="status">
            <p>{submissionStatus}</p>
            <button type="button" onClick={clearSubmissionStatus}>
              clear status
            </button>
          </div>
        ) : null}

        <noscript>
          <style>{`
            .annotation-marker,
            .annotation-toggle,
            .annotation-enhanced-stack,
            .annotation-select-anchor,
            .annotation-composer,
            .annotation-status {
              display: none !important;
            }

            .annotation-nojs-fallback {
              display: block !important;
            }
          `}</style>
        </noscript>

        <div
          ref={shellRef}
          className="archive-annotations-shell"
          data-annotations-visible={visible ? "true" : "false"}
          data-lamp-active={lampActive ? "true" : "false"}
          data-lamp-enabled={lampEnabled ? "true" : "false"}
          onPointerLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
        >
          {children}
        </div>
      </section>
    </AnnotationLayerContext.Provider>
  );
}

export function useAnnotationLayer() {
  return useContext(AnnotationLayerContext);
}
