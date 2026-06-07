interface HeaderProps {
  jobCount: number;
  loading: boolean;
}

export function Header({ jobCount, loading }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <img src="/job_icon.svg" alt="ProductJobs" className="w-8 h-8 flex-shrink-0" />
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight">ProductJobs</span>
            <span className="hidden sm:inline text-slate-600 text-sm font-normal ml-2">Product roles across the web</span>
          </div>
        </div>

        {/* Job count */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span>Loading…</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-slate-600">
              <span className="text-brand-600 font-semibold">{jobCount.toLocaleString()}</span>
              {' '}open roles
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
