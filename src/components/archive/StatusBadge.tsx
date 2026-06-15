import type { ContentStatus } from "@/lib/content";

type StatusBadgeProps = {
  status: ContentStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className="badge" data-status={status}>
      status: {status}
    </span>
  );
}
