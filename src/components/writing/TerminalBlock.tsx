import type { ReactNode } from "react";

type TerminalBlockProps = {
  children: ReactNode;
  title?: string;
  prompt?: string;
};

export function TerminalBlock({ children, title = "terminal", prompt }: TerminalBlockProps) {
  return (
    <figure className="terminal-block">
      <figcaption>
        <span>{title}</span>
        {prompt ? <span>{prompt}</span> : null}
      </figcaption>
      <pre aria-label={`${title} output`} tabIndex={0}>
        <code>{children}</code>
      </pre>
    </figure>
  );
}
