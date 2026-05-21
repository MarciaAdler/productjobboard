import { Job } from '../types/job';
import { JobCard } from './JobCard';
import { SkeletonList } from './Skeleton';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (job: Job) => void;
}

export function JobList({ jobs, loading, selectedId, onSelect }: JobListProps) {
  if (loading) {
    return <SkeletonList count={12} />;
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-sm">No jobs match your filters.</p>
        <p className="text-gray-400 text-xs mt-1">Try broadening your search or date range.</p>
      </div>
    );
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
