export type DateFilter = 'all' | 'today' | '7d' | '30d';

interface DateFilterProps {
  active: DateFilter;
  onChange: (f: DateFilter) => void;
}

const OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

export function DateFilter({ active, onChange }: DateFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === opt.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
