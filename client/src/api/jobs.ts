import { Job } from '../types/job';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/api/jobs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }
  return res.json() as Promise<Job[]>;
}
