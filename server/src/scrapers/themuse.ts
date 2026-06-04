import axios from 'axios';
import { Job } from '../types/job';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince, trimAtBoundary } from '../utils/normalizeJob';

interface TheMuseJob {
  id: number;
  name: string;
  publication_date: string;
  contents: string;
  locations: { name: string }[];
  company: { name: string };
  refs: { landing_page: string };
}

interface TheMuseResponse {
  results: TheMuseJob[];
  page: number;
  page_count: number;
}

const MAX_AGE_DAYS = 90;

async function fetchPage(page: number): Promise<TheMuseJob[]> {
  try {
    const res = await axios.get<TheMuseResponse>(
      `https://www.themuse.com/api/public/jobs?category=Product+Management&location=United+States&page=${page}&descending=true`,
      { timeout: 12000 }
    );
    return res.data.results || [];
  } catch {
    return [];
  }
}

export async function themuseScraper(): Promise<Job[]> {
  // Fetch pages 0–4 in parallel (up to 100 listings)
  const pages = await Promise.all([0, 1, 2, 3, 4].map(fetchPage));
  const allListings = pages.flat();

  return allListings
    .filter(j => isPMRole(j.name))
    .filter(j => {
      // Skip stale listings (The Muse sometimes surfaces old aggregated posts)
      if (!j.publication_date) return false;
      const age = daysSince(j.publication_date);
      return age <= MAX_AGE_DAYS;
    })
    .map(j => {
      const location = j.locations?.[0]?.name || 'United States';
      const descText = htmlToText(j.contents);
      const reqMatch = descText.match(
        /(?:requirements?|qualifications?|what you.ll need|what we.re looking for)[:\s]+([\s\S]{50,1000}?)(?:\n\n|$)/i
      );
      return {
        id: `themuse-${j.id}`,
        atsSource: 'themuse' as const,
        title: j.name,
        company: j.company?.name || 'Unknown',
        location,
        isRemote: /remote/i.test(location),
        postedAt: j.publication_date,
        daysSincePosted: daysSince(j.publication_date),
        ...parseSalary(null),
        applyUrl: j.refs?.landing_page || '',
        companyDescription: null,
        descriptionText: trimAtBoundary(descText, 3000),
        requirements: reqMatch ? trimAtBoundary(reqMatch[1].trim(), 1200) : null,
      };
    });
}
