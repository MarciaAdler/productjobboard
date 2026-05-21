import { useState, useEffect } from 'react';
import { Job } from '../types/job';
import { fetchJobs } from '../api/jobs';

interface UseJobsResult {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useJobs(): UseJobsResult {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchJobs()
      .then(data => {
        if (!cancelled) {
          setJobs(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [tick]);

  return {
    jobs,
    loading,
    error,
    refetch: () => setTick(t => t + 1),
  };
}
