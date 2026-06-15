"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ArchiveAnnotation } from "@/lib/annotations";

type AnnotationLayerContextValue = {
  activeAnchorId: string | null;
  toggleAnchor: (anchorId: string) => void;
  visible: boolean;
};

const AnnotationLayerContext = createContext<AnnotationLayerContextValue>({
  activeAnchorId: null,
  toggleAnchor: () => undefined,
  visible: true,
});

type ArchiveAnnotationsProps = {
  annotations: ArchiveAnnotation[];
  children: ReactNode;
  recordTitle: string;
};

export function ArchiveAnnotations({ annotations, children, recordTitle }: ArchiveAnnotationsProps) {
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) {
      setActiveAnchorId(null);
    }
  }, [visible]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveAnchorId(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const value = useMemo(
    () => ({
      activeAnchorId,
      toggleAnchor: (anchorId: string) => {
        setActiveAnchorId((current) => (current === anchorId ? null : anchorId));
      },
      visible,
    }),
    [activeAnchorId, visible],
  );

  return (
    <AnnotationLayerContext.Provider value={value}>
      <section className="archive-annotations" aria-label={`annotations for ${recordTitle}`}>
        <div className="annotation-toolbar">
          <p className="section-label">archive annotations</p>
          <button
            type="button"
            className="annotation-toggle"
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? "hide annotations" : `show annotations (${annotations.length})`}
          </button>
        </div>

        <noscript>
          <style>{`
            .annotation-marker,
            .annotation-toggle,
            .annotation-enhanced-stack {
              display: none !important;
            }

            .annotation-nojs-fallback {
              display: block !important;
            }
          `}</style>
        </noscript>

        <div
          className="archive-annotations-shell"
          data-annotations-visible={visible ? "true" : "false"}
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
