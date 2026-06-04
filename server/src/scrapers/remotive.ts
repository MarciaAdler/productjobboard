import axios from 'axios';
import { Job } from '../types/job';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  'job-count': number;
  jobs: RemotiveJob[];
}

function isUSOrGlobal(location: string): boolean {
  if (!location || !location.trim()) return true;
  const loc = location.toLowerCase();
  if (/\b(worldwide|anywhere|global|remote)\b/.test(loc)) return true;
  if (/\b(usa|united states|north america|americas)\b/.test(loc)) return true;
  if (/^usa[,;]/.test(loc) || /[,;]\s*usa\b/.test(loc)) return true;
  // Clearly non-US regions
  if (/^(europe|uk|germany|france|spain|australia|india|asia|latin america|latam|apac)$/i.test(loc.trim())) return false;
  return true;
}

export async function remotiveScraper(): Promise<Job[]> {
  try {
    const res = await axios.get<RemotiveResponse>(
      'https://remotive.com/api/remote-jobs?category=product-management&limit=100',
      { timeout: 15000 }
    );
    return (res.data.jobs || [])
      .filter(j => isPMRole(j.title))
      .filter(j => isUSOrGlobal(j.candidate_required_location))
      .map(j => {
        const descText = htmlToText(j.description);
        const reqMatch = descText.match(
          /(?:requirements?|qualifications?|what you.ll need)[:\s]+([\s\S]{50,1000}?)(?:\n\n|$)/i
        );
        return {
          id: `remotive-${j.id}`,
          atsSource: 'remotive' as const,
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location || 'Remote',
          isRemote: true,
          postedAt: j.publication_date,
          daysSincePosted: daysSince(j.publication_date),
          ...parseSalary(j.salary || null),
          applyUrl: j.url,
          companyDescription: null,
          descriptionText: trimAtBoundary(descText, 3000),
          requirements: reqMatch ? trimAtBoundary(reqMatch[1].trim(), 1200) : null,
        };
      });
  } catch {
    return [];
  }
}
