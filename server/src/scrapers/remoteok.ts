import axios from 'axios';
import { Job } from '../types/job';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface RemoteOKJob {
  slug: string;
  id: string;
  epoch: number;
  date: string;
  company: string;
  position: string;
  description: string;
  location: string;
  apply_url: string;
  url: string;
  salary_min: number;
  salary_max: number;
}

export async function remoteokScraper(): Promise<Job[]> {
  try {
    const res = await axios.get<(RemoteOKJob | { legal: string })[]>(
      'https://remoteok.com/api?tag=product-manager',
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProductJobBoard/1.0)' },
        timeout: 15000,
      }
    );
    // First element is legal notice
    const items = ((res.data || []).slice(1)) as RemoteOKJob[];

    return items
      .filter(j => j.position && isPMRole(j.position))
      .map(j => {
        const postedAt = j.date || new Date((j.epoch || 0) * 1000).toISOString();
        const descText = htmlToText(j.description);
        const hasSalary = j.salary_min > 0;
        const salaryRaw = hasSalary
          ? `$${j.salary_min.toLocaleString()} – $${(j.salary_max || j.salary_min).toLocaleString()}`
          : null;
        return {
          id: `remoteok-${j.id || j.slug}`,
          atsSource: 'remoteok' as const,
          title: j.position,
          company: j.company,
          location: j.location || 'Remote',
          isRemote: true,
          postedAt,
          daysSincePosted: daysSince(postedAt),
          salaryRaw,
          salaryMin: hasSalary ? j.salary_min : null,
          salaryMax: hasSalary && j.salary_max > 0 ? j.salary_max : null,
          applyUrl: j.apply_url || j.url,
          companyDescription: null,
          descriptionText: trimAtBoundary(descText, 3000),
          requirements: null,
        };
      });
  } catch {
    return [];
  }
}
