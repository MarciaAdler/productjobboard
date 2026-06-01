import { Job } from '../types/job';
import { JobCard } from './JobCard';
import { SkeletonList } from './Skeleton';
import { EmptyState } from './EmptyState';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (job: Job) => void;
  searchQuery: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function JobList({ jobs, loading, selectedId, onSelect, searchQuery, hasFilters, onClearFilters }: JobListProps) {
  if (loading) return <SkeletonList count={10} />;

  if (jobs.length === 0) {
    return <EmptyState searchQuery={searchQuery} hasFilters={hasFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-2">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={job.id === selectedId}
          onClick={() => onSelect(job)}
        />
      ))}
    </div>
  );
}
