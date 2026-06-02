import axios from 'axios';
import { Job } from '../types/job';
import { GREENHOUSE_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { extractSalaryFromText, daysSince } from '../utils/normalizeJob';

interface GHJob {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
  first_published?: string;
  updated_at?: string;
  content?: string;
  company_name?: string;
}

interface GHResponse {
  jobs: GHJob[];
  meta?: { name?: string };
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<GHResponse>(
      `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
      { timeout: 10000 }
    );
    const companyName = res.data.meta?.name || slug;
    return res.data.jobs
      .filter(j => isPMRole(j.title))
      .map(j => {
        const postedAt = j.first_published || j.updated_at || new Date().toISOString();
        const descText = htmlToText(j.content);
        const reqMatch = descText.match(
          /(?:requirements?|qualifications?|what you.ll need|what we.re looking for)[:\s]*([\s\S]{50,1500}?)(?:\n\n|\z)/i
        );
        const location = j.location?.name || 'Unknown';
        return {
          id: `greenhouse-${j.id}`,
          atsSource: 'greenhouse' as const,
          title: j.title,
          company: companyName,
          location,
          isRemote: /remote/i.test(location),
          postedAt,
          daysSincePosted: daysSince(postedAt),
          ...extractSalaryFromText(descText),
          applyUrl: j.absolute_url,
          companyDescription: null,
          descriptionText: descText.slice(0, 2000),
          requirements: reqMatch ? reqMatch[1].trim().slice(0, 1000) : null,
        };
      });
  } catch {
    return [];
  }
}

export async function greenhouseScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
