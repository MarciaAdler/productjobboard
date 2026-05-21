import { Job } from '../types/job';
import { greenhouseScraper } from './greenhouse';
import { leverScraper } from './lever';
import { ashbyScraper } from './ashby';
import { smartrecruitersScraper } from './smartrecruiters';
import { workableScraper } from './workable';
import { placeholderScraper } from './placeholder';

type Scraper = () => Promise<Job[]>;

const SCRAPERS: Array<{ name: string; fn: Scraper }> = [
  { name: 'greenhouse', fn: greenhouseScraper },
  { name: 'lever', fn: leverScraper },
  { name: 'ashby', fn: ashbyScraper },
  { name: 'smartrecruiters', fn: smartrecruitersScraper },
  { name: 'workable', fn: workableScraper },
  { name: 'placeholder', fn: placeholderScraper },
];

export async function runAll(): Promise<Job[]> {
  console.log('[scrapers] Starting all scrapers...');
  const start = Date.now();

  const results = await Promise.allSettled(
    SCRAPERS.map(async ({ name, fn }) => {
      const scraperStart = Date.now();
      const jobs = await fn();
      console.log(`[${name}] ${jobs.length} PM jobs in ${Date.now() - scraperStart}ms`);
      return jobs;
    })
  );

  const allJobs = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));

  // Deduplicate by id, fallback dedupe on title+company
  const seen = new Set<string>();
  const seenTitleCompany = new Set<string>();
  const unique = allJobs.filter(job => {
    if (seen.has(job.id)) return false;
    const tc = `${job.title.toLowerCase()}::${job.company.toLowerCase()}`;
    if (seenTitleCompany.has(tc)) return false;
    seen.add(job.id);
    seenTitleCompany.add(tc);
    return true;
  });

  // Sort by postedAt descending (newest first)
  unique.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  console.log(`[scrapers] Done: ${unique.length} unique PM jobs in ${Date.now() - start}ms`);
  return unique;
}
