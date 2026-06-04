import axios from 'axios';
import { Job } from '../types/job';
import { RECRUITEE_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface RecruiteeSalary {
  min: number | null;
  max: number | null;
  currency: string | null;
  period: string | null;
}

interface RecruiteeOffer {
  id: number;
  title: string;
  company_name: string;
  location: string;
  city?: string;
  country?: string;
  remote: boolean;
  hybrid?: boolean;
  published_at: string;
  careers_url: string;
  careers_apply_url?: string;
  salary?: RecruiteeSalary;
  description?: string;
  requirements?: string;
}

interface RecruiteeResponse {
  offers: RecruiteeOffer[];
}

function formatRecruiteeSalary(salary?: RecruiteeSalary): string | null {
  if (!salary || (!salary.min && !salary.max)) return null;
  const cur = salary.currency || '';
  if (salary.min && salary.max) return `${cur}${salary.min.toLocaleString()} – ${cur}${salary.max.toLocaleString()}`;
  if (salary.min) return `${cur}${salary.min.toLocaleString()}+`;
  return null;
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<RecruiteeResponse>(
      `https://${slug}.recruitee.com/api/offers/`,
      { timeout: 10000 }
    );
    return (res.data.offers || [])
      .filter(o => isPMRole(o.title))
      .map(o => {
        // published_at format: "2026-05-21 07:41:12 UTC"
        const postedAt = new Date(o.published_at.replace(' UTC', 'Z').replace(' ', 'T')).toISOString();
        const salaryStr = formatRecruiteeSalary(o.salary);
        const descText = o.description ? trimAtBoundary(htmlToText(o.description), 3000) : null;
        const reqText = o.requirements ? trimAtBoundary(htmlToText(o.requirements), 1200) : null;
        return {
          id: `recruitee-${o.id}`,
          atsSource: 'recruitee' as const,
          title: o.title,
          company: o.company_name || slug,
          location: o.location || o.city || 'Unknown',
          isRemote: o.remote === true,
          postedAt,
          daysSincePosted: daysSince(postedAt),
          ...parseSalary(salaryStr),
          applyUrl: o.careers_apply_url || o.careers_url,
          companyDescription: null,
          descriptionText: descText,
          requirements: reqText,
        };
      });
  } catch {
    return [];
  }
}

export async function recruiteeScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    RECRUITEE_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
