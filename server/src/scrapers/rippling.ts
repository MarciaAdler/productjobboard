import axios from 'axios';
import { Job } from '../types/job';
import { RIPPLING_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, extractSalaryFromText, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface RipplingListItem {
  id: string;
  name: string;
  url: string;
  department?: { name: string };
  locations?: Array<{ name: string; country?: string; countryCode?: string; workplaceType?: string }>;
}

interface RipplingListResponse {
  items: RipplingListItem[];
}

interface RipplingPayRange {
  rangeStart?: number;
  rangeEnd?: number;
  currency?: string;
  frequency?: string;
  location?: string;
  isRemote?: boolean;
}

interface RipplingDetail {
  uuid: string;
  name: string;
  companyName?: string;
  url: string;
  createdOn?: string;
  workLocations?: string[];
  description?: { company?: string; role?: string };
  payRangeDetails?: RipplingPayRange[];
  employmentType?: string;
  board?: { name?: string };
}

function extractSalaryFromPayRange(ranges: RipplingPayRange[] | undefined): ReturnType<typeof parseSalary> {
  if (!ranges || ranges.length === 0) return { salaryRaw: null, salaryMin: null, salaryMax: null };
  const range = ranges[0];
  const min = range.rangeStart && range.rangeStart >= 30000 ? range.rangeStart : null;
  const max = range.rangeEnd && range.rangeEnd >= 30000 ? range.rangeEnd : null;
  if (!min && !max) return { salaryRaw: null, salaryMin: null, salaryMax: null };
  const raw = min && max
    ? `$${min.toLocaleString()} – $${max.toLocaleString()}`
    : min ? `$${min.toLocaleString()}+` : `up to $${max!.toLocaleString()}`;
  return { salaryRaw: raw, salaryMin: min, salaryMax: max };
}

async function fetchDetail(slug: string, item: RipplingListItem): Promise<Job | null> {
  try {
    const res = await axios.get<RipplingDetail>(
      `https://ats.rippling.com/api/v2/board/${slug}/jobs/${item.id}`,
      { timeout: 10000 }
    );
    const d = res.data;

    const companyText = htmlToText(d.description?.company);
    const roleText = htmlToText(d.description?.role);
    const fullText = [companyText, roleText].filter(Boolean).join('\n\n');

    const reqMatch = fullText.match(
      /(?:requirements?|qualifications?|what you.ll need|what we.re looking for)[:\s]*([\s\S]{50,1500}?)(?:\n\n|$)/i
    );

    const locations = d.workLocations || item.locations?.map(l => l.name) || [];
    const location = locations.length > 0 ? locations.join(', ') : 'Unknown';
    const isRemote = /remote/i.test(location) ||
      item.locations?.some(l => l.workplaceType?.toLowerCase() === 'remote') || false;

    const postedAt = d.createdOn || new Date().toISOString();
    const companyName = d.companyName || d.board?.name || slug;

    const salaryFromRange = extractSalaryFromPayRange(d.payRangeDetails);
    const salary = salaryFromRange.salaryMin
      ? salaryFromRange
      : extractSalaryFromText(fullText);

    return {
      id: `rippling-${item.id}`,
      atsSource: 'rippling' as const,
      title: d.name || item.name,
      company: companyName,
      location,
      isRemote,
      postedAt,
      daysSincePosted: daysSince(postedAt),
      ...salary,
      applyUrl: d.url || item.url,
      companyDescription: companyText ? trimAtBoundary(companyText, 600) : null,
      descriptionText: roleText ? trimAtBoundary(roleText, 3000) : trimAtBoundary(fullText, 3000),
      requirements: reqMatch ? trimAtBoundary(reqMatch[1].trim(), 1200) : null,
    };
  } catch {
    return null;
  }
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<RipplingListResponse>(
      `https://ats.rippling.com/api/v2/board/${slug}/jobs`,
      { timeout: 10000 }
    );
    const items = res.data.items || [];
    const pmItems = items.filter(j => isPMRole(j.name));

    const results = await Promise.allSettled(pmItems.map(item => fetchDetail(slug, item)));
    return results.flatMap(r => (r.status === 'fulfilled' && r.value ? [r.value] : []));
  } catch {
    return [];
  }
}

export async function ripplingScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    RIPPLING_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
