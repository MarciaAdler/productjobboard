import axios from 'axios';
import { Job } from '../types/job';
import { ASHBY_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince } from '../utils/normalizeJob';

interface AshbyJob {
  id: string;
  title: string;
  location?: string;
  isRemote?: boolean;
  workplaceType?: string;
  publishedAt?: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
  organization?: { name?: string; description?: string };
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<AshbyResponse>(
      `https://api.ashbyhq.com/posting-api/job-board/${slug}`,
      { timeout: 10000 }
    );
    const data = res.data;
    const companyName = data.organization?.name || slug;
    const companyDesc = data.organization?.description || null;

    return (data.jobs || [])
      .filter(j => isPMRole(j.title))
      .map(j => {
        const postedAt = j.publishedAt || new Date().toISOString();
        const descText = j.descriptionPlain || htmlToText(j.descriptionHtml);
        const reqMatch = descText.match(
          /(?:requirements?|qualifications?|what you.ll need|we.re looking for)[:\s]*([\s\S]{50,1500}?)(?:\n\n|$)/i
        );
        const location = j.location || (j.isRemote ? 'Remote' : 'Unknown');
        return {
          id: `ashby-${j.id}`,
          atsSource: 'ashby' as const,
          title: j.title,
          company: companyName,
          location,
          isRemote: j.isRemote === true || /remote/i.test(location),
          postedAt,
          daysSincePosted: daysSince(postedAt),
          ...parseSalary(null),
          applyUrl: j.applyUrl || j.jobUrl || `https://jobs.ashbyhq.com/${slug}/${j.id}`,
          companyDescription: companyDesc,
          descriptionText: descText.slice(0, 2000),
          requirements: reqMatch ? reqMatch[1].trim().slice(0, 1000) : null,
        };
      });
  } catch {
    return [];
  }
}

export async function ashbyScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    ASHBY_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
