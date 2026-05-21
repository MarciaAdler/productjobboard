import { formatDaysAgo, daysAgoColor } from '../utils/dateHelpers';

interface StatusBadgeProps {
  days: number;
}

export function StatusBadge({ days }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${daysAgoColor(days)}`}>
      {formatDaysAgo(days)}
    </span>
  );
}
