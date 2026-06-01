export type DateFilter = 'all' | 'today' | '7d' | '30d';

interface DateFilterProps {
  active: DateFilter;
  onChange: (f: DateFilter) => void;
}

const OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

export function DateFilter({ active, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            active === opt.value
              ? 'bg-white text-brand-700 shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
