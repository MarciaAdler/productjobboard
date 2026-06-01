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
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight">ProductJobs</span>
            <span className="hidden sm:inline text-slate-400 text-sm font-normal ml-2">PM roles across the web</span>
          </div>
        </div>

        {/* Job count */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span>Loading…</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-slate-500">
              <span className="text-brand-600 font-semibold">{jobCount.toLocaleString()}</span>
              {' '}open roles
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
