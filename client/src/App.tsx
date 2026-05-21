import { useMemo, useState } from 'react';
import { Job } from './types/job';
import { useJobs } from './hooks/useJobs';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { DateFilter, DateFilter as DateFilterType } from './components/DateFilter';
import { JobList } from './components/JobList';
import { JobDrawer } from './components/JobDrawer';

export default function App() {
  const { jobs, loading, error } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
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
      });
  }, [jobs, searchQuery, dateFilter]);

  function handleSelect(job: Job) {
    setSelectedJob(prev => (prev?.id === job.id ? null : job));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header jobCount={filteredJobs.length} loading={loading} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <strong>Error loading jobs:</strong> {error}. Make sure the server is running (port 3002) and the Vite proxy is configured.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <DateFilter active={dateFilter} onChange={setDateFilter} />
        </div>

        {!loading && !error && (
          <p className="text-xs text-gray-400 mb-3">
            {filteredJobs.length === jobs.length
              ? `${jobs.length} Product roles`
              : `${filteredJobs.length} of ${jobs.length} roles`}
            {' · '}sourced from Greenhouse, Lever, Ashby, SmartRecruiters & Workable
          </p>
        )}

        <JobList
          jobs={filteredJobs}
          loading={loading}
          selectedId={selectedJob?.id ?? null}
          onSelect={handleSelect}
        />
      </main>

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
