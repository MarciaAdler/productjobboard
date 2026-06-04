import axios from 'axios';
import { Job } from '../types/job';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobGeo: string;
  jobDescription: string;
  pubDate: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
}

interface JobicyResponse {
  jobs: JobicyJob[];
  jobCount: number;
}

export async function jobicyScraper(): Promise<Job[]> {
  try {
    const res = await axios.get<JobicyResponse>(
      'https://jobicy.com/api/v2/remote-jobs?tag=product&geo=usa&count=50',
      { timeout: 12000 }
    );

    return (res.data.jobs || [])
      .filter(j => isPMRole(j.jobTitle))
      .map(j => {
        const descText = htmlToText(j.jobDescription);
        const reqMatch = descText.match(
          /(?:requirements?|qualifications?|what you.ll need)[:\s]+([\s\S]{50,1000}?)(?:\n\n|$)/i
        );

        let salaryRaw: string | null = null;
        let salaryMin: number | null = null;
        let salaryMax: number | null = null;

        if (j.salaryMin && j.salaryMin >= 30000) salaryMin = j.salaryMin;
        if (j.salaryMax && j.salaryMax >= 30000) salaryMax = j.salaryMax;
        if (salaryMin || salaryMax) {
          salaryRaw = salaryMin && salaryMax
            ? `$${salaryMin.toLocaleString()} – $${salaryMax.toLocaleString()}`
            : salaryMin ? `$${salaryMin.toLocaleString()}+` : `up to $${salaryMax!.toLocaleString()}`;
        }

        return {
          id: `jobicy-${j.id}`,
          atsSource: 'jobicy' as const,
          title: j.jobTitle,
          company: j.companyName,
          location: j.jobGeo || 'Remote',
          isRemote: true,
          postedAt: j.pubDate,
          daysSincePosted: daysSince(j.pubDate),
          salaryRaw,
          salaryMin,
          salaryMax,
          applyUrl: j.url,
          industry: null,
          companyDescription: null,
          descriptionText: trimAtBoundary(descText, 3000),
          requirements: reqMatch ? trimAtBoundary(reqMatch[1].trim(), 1200) : null,
        };
      });
  } catch {
    return [];
  }
}
