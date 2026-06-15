import { useId, type ReactNode } from "react";

type DiagramBlockProps = {
  children: ReactNode;
  caption?: string;
  alt?: string;
  size?: "narrow" | "wide";
};

export function DiagramBlock({ children, caption, alt, size = "wide" }: DiagramBlockProps) {
  const captionId = useId();

  return (
    <figure aria-describedby={caption ? captionId : undefined} className="diagram-block" data-size={size}>
      <div aria-label={alt} className="diagram-block-inner" role={alt ? "img" : undefined}>
        {children}
      </div>
      {caption ? <figcaption id={captionId}>{caption}</figcaption> : null}
    </figure>
  );
}
