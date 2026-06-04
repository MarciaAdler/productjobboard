import { Job } from '../types/job';

interface IndustryFilterProps {
  jobs: Job[];
  value: string;
  onChange: (industry: string) => void;
}

export function buildIndustryOptions(jobs: Job[]): { value: string; label: string }[] {
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    if (job.industry) {
      counts[job.industry] = (counts[job.industry] || 0) + 1;
    }
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([industry, count]) => ({ value: industry, label: `${industry} (${count})` }));

  return [{ value: '', label: 'All industries' }, ...sorted];
}

export function IndustryFilter({ jobs, value, onChange }: IndustryFilterProps) {
  const options = buildIndustryOptions(jobs);

  return (
    <div className="relative">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-8 pr-7 py-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer transition-shadow"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function matchesIndustry(job: Job, filter: string): boolean {
  if (!filter) return true;
  return job.industry === filter;
}
