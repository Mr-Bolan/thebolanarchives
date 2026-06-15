import { isValidElement, type ReactNode } from "react";

type CodeBlockProps = {
  children: ReactNode;
  language?: string;
  filename?: string;
  className?: string;
};

export function CodeBlock({ children, language, filename, className }: CodeBlockProps) {
  const inferred = inferCodeChild(children);
  const displayLanguage = language ?? inferred.language;
  const code = inferred.children ?? children;

  return (
    <figure className="code-block">
      {filename || displayLanguage ? (
        <figcaption>
          {filename ? <span>{filename}</span> : null}
          {displayLanguage ? <span>{displayLanguage}</span> : null}
        </figcaption>
      ) : null}
      <pre aria-label={filename ?? displayLanguage ?? "code block"} className={className} tabIndex={0}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}

function inferCodeChild(children: ReactNode): { children?: ReactNode; language?: string } {
  if (!isValidElement(children)) {
    return {};
  }

  const props = children.props as { children?: ReactNode; className?: string };
  const language = props.className?.match(/language-([\w-]+)/)?.[1];

  return {
    children: props.children,
    language,
  };
}
