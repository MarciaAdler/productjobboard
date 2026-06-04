import axios from 'axios';
import { Job } from '../types/job';
import { LEVER_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface LeverJob {
  id: string;
  text: string;
  categories: {
    location?: string;
    team?: string;
    commitment?: string;
    department?: string;
  };
  createdAt: number; // Unix ms
  hostedUrl: string;
  applyUrl: string;
  descriptionPlain?: string;
  salaryRange?: { max?: number; min?: number; currency?: string; interval?: string } | string;
  workplaceType?: string;
  lists?: Array<{ text: string; content: string }>;
}

function formatSalaryRange(sr: LeverJob['salaryRange']): string | null {
  if (!sr) return null;
  if (typeof sr === 'string') return sr;
  if (typeof sr === 'object' && (sr.min || sr.max)) {
    const min = sr.min ? `$${sr.min.toLocaleString()}` : '';
    const max = sr.max ? `$${sr.max.toLocaleString()}` : '';
    if (min && max) return `${min} – ${max}`;
    return min || max;
  }
  return null;
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<LeverJob[]>(
      `https://api.lever.co/v0/postings/${slug}?mode=json`,
      { timeout: 10000 }
    );
    const jobs = Array.isArray(res.data) ? res.data : [];
    return jobs
      .filter(j => isPMRole(j.text))
      .map(j => {
        const postedAt = new Date(j.createdAt).toISOString();
        const location = j.categories?.location || 'Unknown';
        const salaryStr = formatSalaryRange(j.salaryRange);
        const reqList = j.lists?.find(l =>
          /requirement|qualification|you.ll need|looking for/i.test(l.text)
        );
        const desc = j.descriptionPlain || '';
        return {
          id: `lever-${j.id}`,
          atsSource: 'lever' as const,
          title: j.text,
          company: slug.charAt(0).toUpperCase() + slug.slice(1),
          location,
          isRemote: /remote/i.test(location) || j.workplaceType === 'remote',
          postedAt,
          daysSincePosted: daysSince(j.createdAt),
          ...parseSalary(salaryStr),
          applyUrl: j.applyUrl || j.hostedUrl,
          companyDescription: null,
          descriptionText: trimAtBoundary(desc, 3000),
          requirements: reqList ? trimAtBoundary(reqList.content.replace(/<[^>]+>/g, ' ').trim(), 1200) : null,
        };
      });
  } catch {
    return [];
  }
}

export async function leverScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    LEVER_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
