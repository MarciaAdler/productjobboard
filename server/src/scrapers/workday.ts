import axios from 'axios';
import { Job } from '../types/job';
import { WORKDAY_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { parseSalary, daysSince } from '../utils/normalizeJob';

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

function parsePostedOn(postedOn: string): string {
  const lower = postedOn.toLowerCase();
  const now = Date.now();
  if (lower.includes('today') || lower.includes('0 day')) {
    return new Date(now).toISOString();
  }
  const days = lower.match(/(\d+)\+?\s*day/);
  if (days) {
    return new Date(now - parseInt(days[1]) * 86400000).toISOString();
  }
  const weeks = lower.match(/(\d+)\s*week/);
  if (weeks) {
    return new Date(now - parseInt(weeks[1]) * 7 * 86400000).toISOString();
  }
  const months = lower.match(/(\d+)\s*month/);
  if (months) {
    const d = new Date();
    d.setMonth(d.getMonth() - parseInt(months[1]));
    return d.toISOString();
  }
  // "30+ Days Ago" — treat as 30 days
  if (lower.includes('30+')) {
    return new Date(now - 30 * 86400000).toISOString();
  }
  return new Date(now).toISOString();
}

async function fetchCompany(company: typeof WORKDAY_COMPANIES[0]): Promise<Job[]> {
  const { tenant, wdServer, board, displayName } = company;
  const baseUrl = `https://${tenant}.${wdServer}.myworkdayjobs.com`;
  const allJobs: Job[] = [];
  const limit = 20;
  let offset = 0;
  let total = Infinity;

  try {
    while (offset < total && offset < 100) {
      const res = await axios.post<WorkdayResponse>(
        `${baseUrl}/wday/cxs/${tenant}/${board}/jobs`,
        { appliedFacets: {}, limit, offset, searchText: 'product manager' },
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          timeout: 12000,
        }
      );

      total = res.data.total;
      const postings = res.data.jobPostings || [];
      if (postings.length === 0) break;

      for (const p of postings) {
        if (!isPMRole(p.title)) continue;
        const postedAt = parsePostedOn(p.postedOn);
        const applyUrl = `${baseUrl}/en-US/${board}${p.externalPath}`;
        const location = p.locationsText || 'Unknown';
        allJobs.push({
          id: `workday-${tenant}-${(p.jobReqId || p.externalPath).replace(/[^a-z0-9]/gi, '-')}`,
          atsSource: 'workday',
          title: p.title,
          company: displayName,
          location,
          isRemote: /remote/i.test(location),
          postedAt,
          daysSincePosted: daysSince(postedAt),
          ...parseSalary(null),
          applyUrl,
          companyDescription: null,
          descriptionText: null,
          requirements: null,
        });
      }

      offset += limit;
    }
  } catch {
    // Return whatever was collected before the error
  }

  return allJobs;
}

export async function workdayScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    WORKDAY_COMPANIES.map(c => fetchCompany(c))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
