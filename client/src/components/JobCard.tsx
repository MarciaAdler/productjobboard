import { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { formatSalary, ATS_LABELS } from '../utils/dateHelpers';

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryRaw);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-lg p-4 transition-all hover:shadow-sm ${
        isSelected
          ? 'border-indigo-400 ring-1 ring-indigo-400 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
        </div>
        <StatusBadge postedAt={job.postedAt} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {job.location}
        </span>

        {job.isRemote && (
          <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">
            Remote
          </span>
        )}

        {salary && (
          <span className="text-xs text-emerald-700 font-medium">{salary}</span>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {ATS_LABELS[job.atsSource] || job.atsSource}
        </span>
      </div>
    </button>
  );
}
