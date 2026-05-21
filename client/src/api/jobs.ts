import { Job } from '../types/job';

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch('/api/jobs');
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }
  return res.json() as Promise<Job[]>;
}
