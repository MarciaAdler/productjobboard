import axios from 'axios';
import { Job } from '../types/job';
import { SMARTRECRUITERS_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince } from '../utils/normalizeJob';

interface SRPosting {
  id: string;
  name: string;
  company: { name: string; identifier: string };
  releasedDate?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
    fullLocation?: string;
  };
  applyUrl?: string;
  jobAd?: {
    sections?: {
      companyDescription?: { text?: string };
      jobDescription?: { text?: string };
      qualifications?: { text?: string };
    };
  };
}

interface SRListResponse {
  content: SRPosting[];
  totalFound?: number;
}

async function fetchDetail(company: string, id: string): Promise<SRPosting | null> {
  try {
    const res = await axios.get<SRPosting>(
      `https://api.smartrecruiters.com/v1/companies/${company}/postings/${id}`,
      { timeout: 8000 }
    );
    return res.data;
  } catch {
    return null;
  }
}

async function fetchCompany(slug: string): Promise<Job[]> {
  try {
    const res = await axios.get<SRListResponse>(
      `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`,
      { timeout: 10000 }
    );
    const pmJobs = (res.data.content || []).filter(j => isPMRole(j.name));

    const detailed = await Promise.allSettled(
      pmJobs.map(j => fetchDetail(slug, j.id))
    );

    return pmJobs.map((j, i) => {
      const detail: SRPosting | null =
        detailed[i].status === 'fulfilled' ? detailed[i].value : null;
      const merged = detail || j;
      const sections = merged.jobAd?.sections;
      const companyDesc = sections?.companyDescription?.text
        ? htmlToText(sections.companyDescription.text)
        : null;
      const descText = sections?.jobDescription?.text
        ? htmlToText(sections.jobDescription.text)
        : null;
      const requirements = sections?.qualifications?.text
        ? htmlToText(sections.qualifications.text)
        : null;
      const loc = merged.location;
      const location = loc?.fullLocation ||
        [loc?.city, loc?.region, loc?.country].filter(Boolean).join(', ') ||
        'Unknown';
      const postedAt = merged.releasedDate || new Date().toISOString();
      return {
        id: `smartrecruiters-${j.id}`,
        atsSource: 'smartrecruiters' as const,
        title: j.name,
        company: j.company.name,
        location,
        isRemote: loc?.remote === true || /remote/i.test(location),
        postedAt,
        daysSincePosted: daysSince(postedAt),
        ...parseSalary(null),
        applyUrl: merged.applyUrl || `https://jobs.smartrecruiters.com/${slug}/${j.id}`,
        industry: null,
          companyDescription: companyDesc,
        descriptionText: descText ? descText.slice(0, 2000) : null,
        requirements: requirements ? requirements.slice(0, 1000) : null,
      };
    });
  } catch {
    return [];
  }
}

export async function smartrecruitersScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    SMARTRECRUITERS_COMPANIES.map(slug => fetchCompany(slug))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
