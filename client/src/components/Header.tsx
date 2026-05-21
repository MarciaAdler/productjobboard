interface HeaderProps {
  jobCount: number;
  loading: boolean;
}

export function Header({ jobCount, loading }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Product Jobs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Open PM roles across the web
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {loading ? (
            <span className="animate-pulse">Loading jobs...</span>
          ) : (
            <span>{jobCount.toLocaleString()} open roles</span>
          )}
        </div>
      </div>
    </header>
  );
}
