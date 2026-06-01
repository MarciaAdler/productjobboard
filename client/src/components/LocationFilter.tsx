import { Job } from '../types/job';

interface LocationFilterProps {
  jobs: Job[];
  value: string;
  onChange: (loc: string) => void;
}

function extractCity(location: string): string {
  return location.split(',')[0].trim();
}

export function buildLocationOptions(jobs: Job[]): { value: string; label: string }[] {
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    const city = job.isRemote ? 'Remote' : extractCity(job.location);
    if (city && city !== 'Unknown') {
      counts[city] = (counts[city] || 0) + 1;
    }
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([city, count]) => ({ value: city, label: `${city} (${count})` }));

  return [{ value: '', label: 'All locations' }, ...sorted];
}

export function LocationFilter({ jobs, value, onChange }: LocationFilterProps) {
  const options = buildLocationOptions(jobs);

  return (
    <div className="relative">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function matchesLocation(job: Job, filter: string): boolean {
  if (!filter) return true;
  if (filter === 'Remote') return job.isRemote;
  return extractCity(job.location) === filter;
}
