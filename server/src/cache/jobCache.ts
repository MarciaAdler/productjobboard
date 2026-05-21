import { Job } from '../types/job';

const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  jobs: Job[];
  cachedAt: Date;
}

let cache: CacheEntry | null = null;

export function getCache(): Job[] | null {
  if (!cache) return null;
  if (Date.now() - cache.cachedAt.getTime() > TTL_MS) return null;
  return cache.jobs;
}

export function setCache(jobs: Job[]): void {
  cache = { jobs, cachedAt: new Date() };
}

export function getCacheInfo(): { cachedAt: Date | null; jobCount: number; valid: boolean } {
  if (!cache) return { cachedAt: null, jobCount: 0, valid: false };
  const valid = Date.now() - cache.cachedAt.getTime() <= TTL_MS;
  return { cachedAt: cache.cachedAt, jobCount: cache.jobs.length, valid };
}

export function invalidateCache(): void {
  cache = null;
}
