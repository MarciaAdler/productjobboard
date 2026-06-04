import axios from 'axios';
import { Job } from '../types/job';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface GetroBoard {
  url: string;
  vcFirm: string;
}

const GETRO_BOARDS: GetroBoard[] = [
  { url: 'https://jobs.insightpartners.com/jobs?query=product+manager', vcFirm: 'Insight Partners' },
  { url: 'https://jobs.techstars.com/jobs?query=product+manager', vcFirm: 'Techstars' },
  { url: 'https://jobs.primary.vc/jobs?q=product+manager', vcFirm: 'Primary VC' },
];

// Attempt to call Getro's internal JSON API directly
async function tryGetroAPI(networkSlug: string): Promise<unknown[] | null> {
  const slugVariants = [networkSlug, networkSlug.replace(/-/g, ''), networkSlug.replace(/-/g, '_')];
  for (const slug of slugVariants) {
    try {
      const res = await axios.get(
        `https://api.getro.com/v2/networks/${slug}/jobs?limit=100&keywords=product+manager`,
        { headers: { Accept: 'application/json' }, timeout: 6000 }
      );
      if (Array.isArray(res.data?.jobs) && res.data.jobs.length > 0) return res.data.jobs;
    } catch {
      // 403 / 404 — try next variant
    }
  }
  return null;
}

// Parse job data from Getro's embedded __NEXT_DATA__ JSON
function extractFromNextData(html: string): unknown[] {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return [];
  try {
    const nextData = JSON.parse(match[1]);
    const pp = nextData?.props?.pageProps;
    return (
      pp?.jobs ||
      pp?.initialJobs ||
      pp?.jobResults?.jobs ||
      pp?.data?.jobs ||
      pp?.jobListings ||
      []
    );
  } catch {
    return [];
  }
}

function mapGetroJob(raw: Record<string, unknown>, vcFirm: string): Job | null {
  const title = (raw.title || raw.name || '') as string;
  if (!title || !isPMRole(title)) return null;

  const company =
    ((raw.company as Record<string, unknown>)?.name as string) ||
    (raw.companyName as string) ||
    vcFirm;
  const location = (raw.location as string) || (raw.city as string) || 'Unknown';
  const postedAt =
    (raw.postedAt as string) ||
    (raw.publishedAt as string) ||
    (raw.createdAt as string) ||
    new Date().toISOString();
  const applyUrl =
    (raw.applyUrl as string) ||
    (raw.url as string) ||
    (raw.jobUrl as string) ||
    '';
  const descRaw = (raw.description as string) || (raw.descriptionHtml as string) || null;
  const descText = descRaw ? trimAtBoundary(htmlToText(descRaw), 3000) : null;
  const salaryStr = (raw.salary as string) || (raw.compensation as string) || null;

  return {
    id: `getro-${(raw.id as string) || `${company}-${title}`.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    atsSource: 'getro',
    title,
    company,
    location,
    isRemote: (raw.remote as boolean) === true || (raw.isRemote as boolean) === true || /remote/i.test(location),
    postedAt,
    daysSincePosted: daysSince(postedAt),
    ...parseSalary(salaryStr),
    applyUrl,
    industry: null,
          companyDescription: null,
    descriptionText: descText,
    requirements: null,
  };
}

async function fetchBoard(board: GetroBoard): Promise<Job[]> {
  // Try direct API first (requires auth on all tested slugs — returns 401)
  const networkSlug = new URL(board.url).hostname.split('.')[1];
  const apiJobs = await tryGetroAPI(networkSlug);
  if (apiJobs && apiJobs.length > 0) {
    return (apiJobs as Record<string, unknown>[])
      .map(j => mapGetroJob(j, board.vcFirm))
      .filter((j): j is Job => j !== null);
  }

  // Fall back: fetch rendered HTML and parse __NEXT_DATA__
  try {
    const res = await axios.get(board.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html',
      },
      timeout: 15000,
    });
    const rawJobs = extractFromNextData(res.data as string);
    if (rawJobs.length === 0) {
      console.log(`[getro] No job data found in __NEXT_DATA__ for ${board.vcFirm}`);
      return [];
    }
    return (rawJobs as Record<string, unknown>[])
      .map(j => mapGetroJob(j, board.vcFirm))
      .filter((j): j is Job => j !== null);
  } catch (err) {
    console.log(`[getro] Failed to fetch ${board.vcFirm}: ${(err as Error).message}`);
    return [];
  }
}

export async function getroScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(GETRO_BOARDS.map(b => fetchBoard(b)));
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
