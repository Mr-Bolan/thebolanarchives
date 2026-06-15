import { isValidElement, type ReactNode } from "react";

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function getMarkdownHeadings(source: string): TocHeading[] {
  const counts = new Map<string, number>();

  return source
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^(#{2,3})\s+(.+?)(?:\s+#+)?$/);

      if (!match) {
        return [];
      }

      const text = stripMarkdown(match[2]);

      if (!text) {
        return [];
      }

      return [
        {
          id: slugifyHeading(text, counts),
          text,
          level: match[1].length as 2 | 3,
        },
      ];
    });
}

export function slugifyHeading(text: string, counts = new Map<string, number>()): string {
  const base =
    text
      .toLowerCase()
      .replace(/[`*_~[\]()]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const seen = counts.get(base) ?? 0;

  counts.set(base, seen + 1);

  return seen === 0 ? base : `${base}-${seen + 1}`;
}

export function textFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("");
  }

  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    return textFromChildren(props.children);
  }

  return "";
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}
