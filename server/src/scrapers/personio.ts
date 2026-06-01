import axios from 'axios';
import { Job } from '../types/job';
import { PERSONIO_COMPANIES } from '../constants/companies';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { parseSalary, daysSince } from '../utils/normalizeJob';

// Extract content between XML tags, stripping CDATA wrappers
function xmlTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

// Extract all occurrences of a tag
function xmlTagAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim());
  }
  return results;
}

// Split XML into individual <position> blocks
function splitPositions(xml: string): string[] {
  const re = /<position>([\s\S]*?)<\/position>/gi;
  const positions: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    positions.push(m[1]);
  }
  return positions;
}

async function fetchCompany(company: typeof PERSONIO_COMPANIES[0]): Promise<Job[]> {
  const { slug, tld, displayName } = company;
  try {
    // XML feed contains full descriptions and createdAt — much richer than search.json
    const res = await axios.get<string>(
      `https://${slug}.jobs.personio.${tld}/xml?language=en`,
      { timeout: 15000, responseType: 'text' }
    );

    const positions = splitPositions(res.data);
    const jobs: Job[] = [];

    for (const pos of positions) {
      const title = xmlTag(pos, 'title');
      if (!title || !isPMRole(title)) continue;

      const id = xmlTag(pos, 'id');
      const office = xmlTag(pos, 'office');
      const createdAt = xmlTag(pos, 'createdAt') || xmlTag(pos, 'createdat');
      const salary = xmlTag(pos, 'salaryInformation') || xmlTag(pos, 'salaryinformation');
      const subcompany = xmlTag(pos, 'subcompany');

      // Collect all <value> blocks inside <jobDescriptions>
      const jobDescSection = pos.match(/<jobDescriptions>([\s\S]*?)<\/jobDescriptions>/i)?.[1] || '';
      const descValues = xmlTagAll(jobDescSection, 'value');
      const fullDescHtml = descValues.join('\n');
      const descText = htmlToText(fullDescHtml);

      // Try to split description vs requirements sections
      const reqMatch = descText.match(
        /(?:requirements?|qualifications?|what you.ll need|we.re looking for)[:\s]+([\s\S]{30,1000}?)(?:\n\n|$)/i
      );

      const postedAt = createdAt
        ? new Date(createdAt).toISOString()
        : new Date().toISOString();

      jobs.push({
        id: `personio-${id || title.replace(/\s+/g, '-').toLowerCase()}`,
        atsSource: 'personio' as const,
        title,
        company: subcompany || displayName,
        location: office || 'Unknown',
        isRemote: /remote/i.test(office || ''),
        postedAt,
        daysSincePosted: daysSince(postedAt),
        ...parseSalary(salary || null),
        applyUrl: `https://${slug}.jobs.personio.${tld}/job/${id}`,
        companyDescription: null,
        descriptionText: descText ? descText.slice(0, 2000) : null,
        requirements: reqMatch ? reqMatch[1].trim().slice(0, 1000) : null,
      });
    }

    return jobs;
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
