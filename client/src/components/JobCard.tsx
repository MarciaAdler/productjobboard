import { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { formatSalary, ATS_LABELS } from '../utils/dateHelpers';

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

function formatLocation(location: string, isRemote: boolean): string {
  if (isRemote && (location === 'Remote' || location === 'Unknown' || !location)) return 'Remote';
  // Workday returns "N Locations" when a role spans multiple offices
  if (/^\d+\s+locations?$/i.test(location.trim())) return 'Multiple locations';
  // Trim to "City, State" — drop country suffix
  const parts = location.split(',').map(s => s.trim());
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return parts[0];
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryRaw);
  const location = formatLocation(job.location, job.isRemote);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border transition-all duration-150 group ${
        isSelected
          ? 'border-brand-300 shadow-sm shadow-brand-100 ring-1 ring-brand-300'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className={`flex items-stretch rounded-xl overflow-hidden ${isSelected ? 'bg-brand-50/40' : ''}`}>
        {/* Left accent bar */}
        <div className={`w-1 flex-shrink-0 rounded-l-xl transition-colors ${isSelected ? 'bg-brand-500' : 'bg-transparent group-hover:bg-slate-200'}`} />

        <div className="flex-1 p-4 min-w-0">
          {/* Top row: title + badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold text-sm leading-snug truncate transition-colors ${
                isSelected ? 'text-brand-900' : 'text-slate-900 group-hover:text-brand-800'
              }`}>
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 truncate">{job.company}</p>
            </div>
            <StatusBadge postedAt={job.postedAt} />
          </div>

          {/* Bottom row: location + salary + source */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="truncate max-w-[160px]">{location}</span>
            </span>

            {job.isRemote && location !== 'Remote' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                Remote
              </span>
            )}

            <span className={`text-xs font-medium ${salary ? 'text-emerald-700' : 'text-slate-300'}`}>
              {salary ?? 'Salary not listed'}
            </span>

            <span className="ml-auto text-xs text-slate-300 flex-shrink-0">
              {ATS_LABELS[job.atsSource] || job.atsSource}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
