type TagListProps = {
  items: string[];
  label?: string;
  limit?: number;
};

export function TagList({ items, label, limit }: TagListProps) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ul className="record-tags" aria-label={label}>
      {visibleItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
