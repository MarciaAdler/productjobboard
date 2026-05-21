import { Job } from '../types/job';

interface LocationFilterProps {
  jobs: Job[];
  value: string;
  onChange: (loc: string) => void;
}

function extractCity(location: string): string {
  // "San Francisco, California, United States" → "San Francisco"
  // "London" → "London"
  // "Remote" → "Remote"
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
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function matchesLocation(job: Job, filter: string): boolean {
  if (!filter) return true;
  if (filter === 'Remote') return job.isRemote;
  return extractCity(job.location) === filter;
}
