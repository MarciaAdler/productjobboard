import axios from 'axios';
import { Job } from '../types/job';
import { PERSONIO_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { parseSalary, daysSince } from '../utils/normalizeJob';

interface PersonioJob {
  id: number;
  name: string;
  department: string;
  office: string;
  employment_type?: string;
  seniority?: string;
  schedule?: string;
  subcompany?: string;
}

async function fetchCompany(company: typeof PERSONIO_COMPANIES[0]): Promise<Job[]> {
  const { slug, tld, displayName } = company;
  try {
    const res = await axios.get<PersonioJob[]>(
      `https://${slug}.jobs.personio.${tld}/search.json`,
      { timeout: 10000 }
    );
    const jobs = Array.isArray(res.data) ? res.data : [];
    return jobs
      .filter(j => isPMRole(j.name))
      .map(j => ({
        id: `personio-${j.id}`,
        atsSource: 'personio' as const,
        title: j.name,
        company: j.subcompany || displayName,
        location: j.office || 'Unknown',
        isRemote: /remote/i.test(j.office || ''),
        // Personio search.json has no posted date — default to now
        postedAt: new Date().toISOString(),
        daysSincePosted: 0,
        ...parseSalary(null),
        applyUrl: `https://${slug}.jobs.personio.${tld}/job/${j.id}`,
        companyDescription: null,
        descriptionText: null,
        requirements: null,
      }));
  } catch {
    return [];
  }
}

export async function personioScraper(): Promise<Job[]> {
  const results = await Promise.allSettled(
    PERSONIO_COMPANIES.map(c => fetchCompany(c))
  );
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}
