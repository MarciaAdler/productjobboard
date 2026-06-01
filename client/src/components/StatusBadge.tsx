import { formatTimeAgo, timeAgoColor } from '../utils/dateHelpers';

interface StatusBadgeProps {
  postedAt: string;
}

export function StatusBadge({ postedAt }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${timeAgoColor(postedAt)}`}>
      {formatTimeAgo(postedAt)}
    </span>
  );
}
