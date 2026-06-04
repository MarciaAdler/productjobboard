import { Job } from '../types/job';
import { greenhouseScraper } from './greenhouse';
import { leverScraper } from './lever';
import { ashbyScraper } from './ashby';
import { smartrecruitersScraper } from './smartrecruiters';
import { workableScraper } from './workable';
import { workdayScraper } from './workday';
import { recruiteeScraper } from './recruitee';
import { personioScraper } from './personio';
import { remotiveScraper } from './remotive';
import { remoteokScraper } from './remoteok';
import { themuseScraper } from './themuse';
import { getroScraper } from './getro';
import { placeholderScraper } from './placeholder';
import { ripplingScraper } from './rippling';
import { isUSOrRemote } from '../utils/filterUS';
import { getIndustry } from '../constants/industries';

type Scraper = () => Promise<Job[]>;

const SCRAPERS: Array<{ name: string; fn: Scraper }> = [
  { name: 'greenhouse', fn: greenhouseScraper },
  { name: 'lever', fn: leverScraper },
  { name: 'ashby', fn: ashbyScraper },
  { name: 'smartrecruiters', fn: smartrecruitersScraper },
  { name: 'workable', fn: workableScraper },
  { name: 'workday', fn: workdayScraper },
  { name: 'recruitee', fn: recruiteeScraper },
  { name: 'personio', fn: personioScraper },
  { name: 'remotive', fn: remotiveScraper },
  { name: 'remoteok', fn: remoteokScraper },
  { name: 'themuse', fn: themuseScraper },
  { name: 'getro (vc boards)', fn: getroScraper },
  { name: 'rippling', fn: ripplingScraper },
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

  // Filter to US + remote only
  const usJobs = allJobs.filter(isUSOrRemote);
  const filtered = allJobs.length - usJobs.length;
  if (filtered > 0) console.log(`[scrapers] Filtered ${filtered} non-US jobs`);

  // Deduplicate: by id first, then by title+company
  const seenIds = new Set<string>();
  const seenTitleCompany = new Set<string>();
  const unique = usJobs.filter(job => {
    if (seenIds.has(job.id)) return false;
    const tc = `${job.title.toLowerCase()}::${job.company.toLowerCase()}`;
    if (seenTitleCompany.has(tc)) return false;
    seenIds.add(job.id);
    seenTitleCompany.add(tc);
    return true;
  });

  // Enrich with industry from company name lookup
  const enriched = unique.map(job => ({
    ...job,
    industry: job.industry ?? getIndustry(job.company),
  }));

  // Sort by postedAt descending (newest first)
  enriched.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  console.log(`[scrapers] Done: ${enriched.length} unique US/remote PM jobs in ${Date.now() - start}ms`);
  return enriched;
}
