import type { ContentConfidence } from "@/lib/content";

type ConfidenceBadgeProps = {
  confidence: ContentConfidence;
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return <span className="badge">confidence: {confidence}</span>;
}
