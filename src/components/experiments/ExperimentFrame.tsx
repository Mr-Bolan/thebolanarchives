import type { ReactNode } from "react";

type ExperimentFrameProps = {
  title?: string;
  explanation?: ReactNode;
  fallback?: ReactNode;
  fallbackText?: ReactNode;
  children?: ReactNode;
};

export function ExperimentFrame({ title, explanation, fallback, fallbackText, children }: ExperimentFrameProps) {
  const staticFallback = fallback ?? fallbackText;

  return (
    <section className="experiment-frame" aria-label={title ?? "experiment frame"}>
      {title ? <h2>{title}</h2> : null}
      {explanation ? <div className="experiment-explanation">{explanation}</div> : null}
      {staticFallback ? (
        <div className="experiment-fallback">
          <p className="section-label">static fallback</p>
          <div>{staticFallback}</div>
        </div>
      ) : null}
      {children ? <div className="experiment-body">{children}</div> : null}
    </section>
  );
}
