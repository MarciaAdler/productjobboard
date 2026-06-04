import axios from 'axios';
import { Job } from '../types/job';
import { ASHBY_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince } from '../utils/normalizeJob';

interface CompensationComponent {
  compensationType: string;
  minValue?: number;
  maxValue?: number;
  currency?: string;
}

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
  compensation?: {
    compensationTierSummary?: string;
    compensationTiers?: { components?: CompensationComponent[] }[];
  };
}

interface AshbyResponse {
  jobs: AshbyJob[];
  organization?: { name?: string; description?: string };
}

function extractAshbyCompensation(comp: AshbyJob['compensation']): ReturnType<typeof parseSalary> {
  if (!comp) return parseSalary(null);

  // Use the summary string if available
  const summary = comp.compensationTierSummary;
  if (summary) {
    // Extract salary component only (ignore equity line)
    const salaryPart = summary.split('•')[0].trim();
    return parseSalary(salaryPart);
  }

  // Fall back to structured tiers
  const salaryComponent = comp.compensationTiers
    ?.flatMap(t => t.components || [])
    .find(c => c.compensationType === 'Salary' || c.compensationType === 'HourlyCompensation');

  if (salaryComponent?.minValue) {
    const raw = salaryComponent.maxValue
      ? `$${salaryComponent.minValue.toLocaleString()} – $${salaryComponent.maxValue.toLocaleString()}`
      : `$${salaryComponent.minValue.toLocaleString()}`;
    return { salaryRaw: raw, salaryMin: salaryComponent.minValue, salaryMax: salaryComponent.maxValue ?? null };
  }

  return parseSalary(null);
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<AshbyResponse>(
      `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`,
      { timeout: 10000 }
    );
    const data = res.data;
    const companyName = data.organization?.name || slug;
    const companyDesc = data.organization?.description || null;

    return (data.jobs || [])
      .filter(j => isPMRole(j.title))
      .map(j => {
        const postedAt = j.publishedAt || new Date().toISOString();
        const rawDesc = j.descriptionPlain || htmlToText(j.descriptionHtml);
        const descText = rawDesc.slice(0, 2000);
        const reqMatch = rawDesc.match(
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
          ...extractAshbyCompensation(j.compensation),
          applyUrl: j.applyUrl || j.jobUrl || `https://jobs.ashbyhq.com/${slug}/${j.id}`,
          industry: null,
          companyDescription: companyDesc,
          descriptionText: descText,
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
