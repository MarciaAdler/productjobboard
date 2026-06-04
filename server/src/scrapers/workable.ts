import axios from 'axios';
import { Job } from '../types/job';
import { WORKABLE_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface WorkableJob {
  id?: string;
  shortcode?: string;
  title: string;
  location?: { location_str?: string; city?: string; country?: string; remote?: boolean };
  remote?: boolean;
  published_on?: string;
  created_at?: string;
  url?: string;
  application_url?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
}

interface WorkableResponse {
  name?: string;
  description?: string;
  jobs?: WorkableJob[];
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<WorkableResponse>(
      `https://apply.workable.com/api/v1/widget/accounts/${slug}`,
      { timeout: 10000 }
    );
    const data = res.data;
    const companyName = data.name || slug;
    const companyDesc = data.description || null;

    return (data.jobs || [])
      .filter(j => isPMRole(j.title))
      .map(j => {
        const postedAt = j.published_on || j.created_at || new Date().toISOString();
        const descText = j.description ? htmlToText(j.description) : null;
        const reqText = j.requirements ? htmlToText(j.requirements) : null;
        const loc = j.location;
        const location = loc?.location_str ||
          [loc?.city, loc?.country].filter(Boolean).join(', ') ||
          'Unknown';
        const id = j.shortcode || j.id || `${slug}-${j.title}`;
        return {
          id: `workable-${id}`,
          atsSource: 'workable' as const,
          title: j.title,
          company: companyName,
          location,
          isRemote: j.remote === true || loc?.remote === true || /remote/i.test(location),
          postedAt,
          daysSincePosted: daysSince(postedAt),
          ...parseSalary(null),
          applyUrl: j.application_url || j.url || `https://apply.workable.com/${slug}/j/${id}`,
          companyDescription: companyDesc,
          descriptionText: descText ? trimAtBoundary(descText, 3000) : null,
          requirements: reqText ? trimAtBoundary(reqText, 1200) : null,
        };
      });
  } catch {
    return [];
  }
}

export async function workableScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    WORKABLE_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
