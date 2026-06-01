export function Skeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-stretch">
        <div className="w-1 bg-slate-100 flex-shrink-0" />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 bg-slate-100 rounded-md w-3/5 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-md w-2/5 animate-pulse" />
            </div>
            <div className="h-5 bg-slate-100 rounded-full w-16 animate-pulse flex-shrink-0" />
          </div>
          <div className="mt-3 flex gap-3">
            <div className="h-3 bg-slate-100 rounded-md w-28 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-md w-20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
}
