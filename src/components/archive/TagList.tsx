import Link from "next/link";

type TagListProps = {
  items: string[];
  label?: string;
  limit?: number;
  hrefFor?: (item: string) => string;
};

export function TagList({ items, label, limit, hrefFor }: TagListProps) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ul className="record-tags" aria-label={label}>
      {visibleItems.map((item) => (
        <li key={item}>
          {hrefFor ? (
            <Link className="record-tag-link" href={hrefFor(item)}>
              {item}
            </Link>
          ) : (
            item
          )}
        </li>
      ))}
    </ul>
  );
}

export function tagGardenHref(tag: string): string {
  return `/garden?tag=${encodeURIComponent(tag)}`;
}
