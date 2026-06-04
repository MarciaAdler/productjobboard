import axios from 'axios';
import { Job } from '../types/job';
import { WORKDAY_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface WorkdayPosting {
  title: string;
  externalPath: string;
  locationsText: string;
  postedOn: string;
  bulletFields?: string[];
  jobReqId?: string;
}

interface WorkdayResponse {
  jobPostings: WorkdayPosting[];
  total: number;
}

interface WorkdayDetail {
  jobPostingInfo?: {
    jobDescription?: string;
    additionalJobDescription?: string;
  };
}

function parsePostedOn(postedOn: string): string {
  const lower = postedOn.toLowerCase();
  const now = Date.now();
  if (lower.includes('today') || lower.includes('0 day')) return new Date(now).toISOString();
  const days = lower.match(/(\d+)\+?\s*day/);
  if (days) return new Date(now - parseInt(days[1]) * 86400000).toISOString();
  const weeks = lower.match(/(\d+)\s*week/);
  if (weeks) return new Date(now - parseInt(weeks[1]) * 7 * 86400000).toISOString();
  const months = lower.match(/(\d+)\s*month/);
  if (months) {
    const d = new Date();
    d.setMonth(d.getMonth() - parseInt(months[1]));
    return d.toISOString();
  }
  if (lower.includes('30+')) return new Date(now - 30 * 86400000).toISOString();
  return new Date(now).toISOString();
}

// Derive the CXS detail URL from the public apply URL
function detailApiUrl(applyUrl: string): string | null {
  try {
    const url = new URL(applyUrl);
    const tenant = url.hostname.split('.')[0];
    const parts = url.pathname.split('/');
    // pathname: /en-US/{board}/job/{location}/{title_reqId}
    const jobIdx = parts.indexOf('job');
    if (jobIdx < 2) return null;
    const board = parts[jobIdx - 1];
    const externalPath = '/' + parts.slice(jobIdx).join('/');
    return `${url.protocol}//${url.hostname}/wday/cxs/${tenant}/${board}${externalPath}`;
  } catch {
    return null;
  }
}

async function fetchDetail(applyUrl: string): Promise<{ descriptionText: string | null; requirements: string | null }> {
  const url = detailApiUrl(applyUrl);
  if (!url) return { descriptionText: null, requirements: null };
  try {
    const res = await axios.get<WorkdayDetail>(url, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });
    const info = res.data?.jobPostingInfo;
    if (!info) return { descriptionText: null, requirements: null };

    const html = [info.jobDescription, info.additionalJobDescription].filter(Boolean).join('\n');
    const text = htmlToText(html);
    const reqMatch = text.match(
      /(?:requirements?|qualifications?|what you.ll need|we.re looking for|you will bring)[:\s]+([\s\S]{30,1000}?)(?:\n\n|$)/i
    );
    return {
      descriptionText: trimAtBoundary(text, 3000) || null,
      requirements: reqMatch ? trimAtBoundary(reqMatch[1].trim(), 1200) : null,
    };
  } catch {
    return { descriptionText: null, requirements: null };
  }
}

// Run promises in batches to avoid overwhelming the API
async function batchedDetails(jobs: Job[], batchSize = 5): Promise<void> {
  for (let i = 0; i < jobs.length; i += batchSize) {
    await Promise.all(
      jobs.slice(i, i + batchSize).map(async job => {
        const detail = await fetchDetail(job.applyUrl);
        job.descriptionText = detail.descriptionText;
        job.requirements = detail.requirements;
      })
    );
  }
}

async function fetchCompany(company: typeof WORKDAY_COMPANIES[0]): Promise<Job[]> {
  const { tenant, wdServer, board, displayName } = company;
  const baseUrl = `https://${tenant}.${wdServer}.myworkdayjobs.com`;
  const pmJobs: Job[] = [];
  const limit = 20;
  let offset = 0;
  let total = Infinity;

  try {
    while (offset < total && offset < 100) {
      const res = await axios.post<WorkdayResponse>(
        `${baseUrl}/wday/cxs/${tenant}/${board}/jobs`,
        { appliedFacets: {}, limit, offset, searchText: 'product manager' },
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, timeout: 12000 }
      );
      total = res.data.total;
      const postings = res.data.jobPostings || [];
      if (postings.length === 0) break;

      for (const p of postings) {
        if (!isPMRole(p.title)) continue;
        const postedAt = parsePostedOn(p.postedOn);
        const location = p.locationsText || 'Unknown';
        pmJobs.push({
          id: `workday-${tenant}-${(p.jobReqId || p.externalPath).replace(/[^a-z0-9]/gi, '-')}`,
          atsSource: 'workday',
          title: p.title,
          company: displayName,
          location,
          isRemote: /remote/i.test(location),
          postedAt,
          daysSincePosted: daysSince(postedAt),
          ...parseSalary(null),
          applyUrl: `${baseUrl}/en-US/${board}${p.externalPath}`,
          industry: null,
          companyDescription: null,
          descriptionText: null,
          requirements: null,
        });
      }
      offset += limit;
    }
  } catch { /* return what was collected */ }

  // Fetch full descriptions for all PM jobs found
  if (pmJobs.length > 0) {
    await batchedDetails(pmJobs);
  }

  return pmJobs;
}

export async function workdayScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    WORKDAY_COMPANIES.map(c => fetchCompany(c))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
