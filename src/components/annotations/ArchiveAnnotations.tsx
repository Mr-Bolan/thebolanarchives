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
import type { ArchiveAnnotation } from "@/lib/annotations";

type AnnotationLayerContextValue = {
  activeAnchorId: string | null;
  nearAnchorId: string | null;
  toggleAnchor: (anchorId: string) => void;
  visible: boolean;
};

const AnnotationLayerContext = createContext<AnnotationLayerContextValue>({
  activeAnchorId: null,
  nearAnchorId: null,
  toggleAnchor: () => undefined,
  visible: false,
});

type ArchiveAnnotationsProps = {
  annotations: ArchiveAnnotation[];
  children: ReactNode;
  recordTitle: string;
};

export function ArchiveAnnotations({ annotations, children, recordTitle }: ArchiveAnnotationsProps) {
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [lampEnabled, setLampEnabled] = useState(false);
  const [lampActive, setLampActive] = useState(false);
  const [nearAnchorId, setNearAnchorId] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

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
        setActiveAnchorId(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

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

  const value = useMemo(
    () => ({
      activeAnchorId,
      nearAnchorId,
      toggleAnchor: (anchorId: string) => {
        setVisible(true);
        setActiveAnchorId((current) => (visible && current === anchorId ? null : anchorId));
      },
      visible,
    }),
    [activeAnchorId, nearAnchorId, visible],
  );

  return (
    <AnnotationLayerContext.Provider value={value}>
      <section className="archive-annotations" aria-label={`annotations for ${recordTitle}`}>
        <div className="annotation-toolbar">
          <p className="section-label">archive annotations</p>
          <button
            type="button"
            className="annotation-toggle"
            aria-label={`inspection layer ${visible ? "open" : "sealed"}; toggle archive annotation layer`}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? "inspection layer: open" : `inspection layer: sealed (${annotations.length})`}
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
