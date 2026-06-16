"use client";

type AnnotationMarkerProps = {
  anchorLabel: string;
  controlsId: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
};

export function AnnotationMarker({
  anchorLabel,
  controlsId,
  count,
  isOpen,
  onToggle,
}: AnnotationMarkerProps) {
  const noun = count === 1 ? "annotation" : "annotations";

  return (
    <button
      type="button"
      className="annotation-marker"
      aria-controls={controlsId}
      aria-expanded={isOpen}
      aria-label={`${isOpen ? "collapse" : "open"} ${count} ${noun} for ${anchorLabel}`}
      data-open={isOpen ? "true" : "false"}
      onClick={onToggle}
    >
      {count === 1 ? "note 01" : `notes ${String(count).padStart(2, "0")}`}
    </button>
  );
}
