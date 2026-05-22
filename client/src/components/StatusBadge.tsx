import { formatTimeAgo, timeAgoColor } from '../utils/dateHelpers';

interface StatusBadgeProps {
  postedAt: string;
}

export function StatusBadge({ postedAt }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${timeAgoColor(postedAt)}`}>
      {formatTimeAgo(postedAt)}
    </span>
  );
}
