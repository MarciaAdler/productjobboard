import { useEffect, useRef } from 'react';
import { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { formatSalary, ATS_LABELS } from '../utils/dateHelpers';

interface JobDrawerProps {
  job: Job | null;
  onClose: () => void;
}

export function JobDrawer({ job, onClose }: JobDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const salary = job ? formatSalary(job.salaryMin, job.salaryMax, job.salaryRaw) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-20 transition-opacity duration-200 ${
          job ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-out ${
          job ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {job && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h2>
                <p className="text-base text-gray-700 mt-1">{job.company}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge postedAt={job.postedAt} />
                  <span className="text-xs text-gray-500">{job.location}</span>
                  {job.isRemote && (
                    <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">
                      Remote
                    </span>
                  )}
                  <span className={`text-xs font-semibold ${salary ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {salary ?? 'Salary not listed'}
                  </span>
                  <span className="text-xs text-gray-400">
                    via {ATS_LABELS[job.atsSource] || job.atsSource}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {job.companyDescription && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    About {job.company}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{job.companyDescription}</p>
                </section>
              )}

              {job.requirements && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Key Requirements
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </p>
                </section>
              )}

              {job.descriptionText && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    About the Role
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.descriptionText}
                  </p>
                </section>
              )}

              {!job.companyDescription && !job.requirements && !job.descriptionText && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No additional details available. View the original posting to learn more.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
              >
                View Posting & Apply
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
