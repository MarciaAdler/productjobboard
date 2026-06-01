import { useMemo, useState } from 'react';
import { Job } from './types/job';
import { useJobs } from './hooks/useJobs';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { DateFilter, DateFilter as DateFilterType } from './components/DateFilter';
import { LocationFilter, matchesLocation } from './components/LocationFilter';
import { JobList } from './components/JobList';
import { JobDrawer } from './components/JobDrawer';

export default function App() {
  const { jobs, loading, error } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(job => {
        if (dateFilter === 'all') return true;
        if (dateFilter === 'today') return job.daysSincePosted <= 1;
        if (dateFilter === '7d') return job.daysSincePosted <= 7;
        if (dateFilter === '30d') return job.daysSincePosted <= 30;
        return true;
      })
      .filter(job => matchesLocation(job, locationFilter));
  }, [jobs, searchQuery, dateFilter, locationFilter]);

  const hasFilters = searchQuery !== '' || dateFilter !== 'all' || locationFilter !== '';

  function clearFilters() {
    setSearchQuery('');
    setDateFilter('all');
    setLocationFilter('');
  }

  function handleSelect(job: Job) {
    setSelectedJob(prev => (prev?.id === job.id ? null : job));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header jobCount={filteredJobs.length} loading={loading} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Error state */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-medium">Unable to load jobs</p>
              <p className="text-red-600 mt-0.5 text-xs">Make sure the server is running on port 3002.</p>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <LocationFilter jobs={jobs} value={locationFilter} onChange={setLocationFilter} />
          <DateFilter active={dateFilter} onChange={setDateFilter} />
        </div>

        {/* Results meta */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-400">
              {filteredJobs.length === jobs.length
                ? <><span className="font-medium text-slate-500">{jobs.length.toLocaleString()} roles</span> found · refreshes every hour</>
                : <><span className="font-medium text-slate-500">{filteredJobs.length.toLocaleString()}</span> of {jobs.length.toLocaleString()} roles</>
              }
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Job list */}
        <JobList
          jobs={filteredJobs}
          loading={loading}
          selectedId={selectedJob?.id ?? null}
          onSelect={handleSelect}
          searchQuery={searchQuery}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />
      </main>

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
