import { useEffect, useRef } from 'react';
import { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { formatSalary, ATS_LABELS } from '../utils/dateHelpers';

interface JobDrawerProps {
  job: Job | null;
  onClose: () => void;
}

function MetaChip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
}

export function JobDrawer({ job, onClose }: JobDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const salary = job ? formatSalary(job.salaryMin, job.salaryMax, job.salaryRaw) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-20 transition-opacity duration-200 ${
          job ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-out ${
          job ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {job && (
          <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 leading-snug">{job.title}</h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">{job.company}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <StatusBadge postedAt={job.postedAt} />

                    <MetaChip className="bg-slate-100 text-slate-600">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {/^\d+\s+locations?$/i.test(job.location.trim()) ? 'Multiple locations' : job.location.split(',')[0]}
                    </MetaChip>

                    {job.isRemote && (
                      <MetaChip className="bg-brand-50 text-brand-700 border border-brand-100">Remote</MetaChip>
                    )}

                    {salary ? (
                      <MetaChip className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                        </svg>
                        {salary}
                      </MetaChip>
                    ) : (
                      <span className="text-xs text-slate-300 px-1">Salary not listed</span>
                    )}

                    <MetaChip className="bg-slate-50 text-slate-400 ml-auto">
                      via {ATS_LABELS[job.atsSource] || job.atsSource}
                    </MetaChip>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {job.companyDescription || job.requirements || job.descriptionText ? (
                <div className="divide-y divide-slate-100">
                  {job.companyDescription && (
                    <section className="px-6 py-5">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">About {job.company}</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{job.companyDescription}</p>
                    </section>
                  )}

                  {job.requirements && (
                    <section className="px-6 py-5">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Key Requirements</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                    </section>
                  )}

                  {job.descriptionText && (
                    <section className="px-6 py-5">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">About the Role</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.descriptionText}</p>
                    </section>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">No details available</p>
                  <p className="text-xs text-slate-400 mt-1">View the original posting for the full description.</p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm shadow-sm shadow-brand-200"
              >
                View Posting & Apply
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
