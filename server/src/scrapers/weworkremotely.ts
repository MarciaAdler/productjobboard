import axios from 'axios';
import { Job } from '../types/job';
import { isPMRole } from '../utils/filterPM';
import { htmlToText } from '../utils/htmlToText';
import { daysSince, trimAtBoundary } from '../utils/normalizeJob';

function xmlTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function splitItems(xml: string): string[] {
  const re = /<item>([\s\S]*?)<\/item>/gi;
  const items: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  return items;
}

// WWR title format: "Company: Job Title" — split on first ": "
function parseTitle(raw: string): { company: string; title: string } {
  const idx = raw.indexOf(': ');
  if (idx === -1) return { company: '', title: raw };
  return { company: raw.slice(0, idx).trim(), title: raw.slice(idx + 2).trim() };
}

export async function weworkremotelyScraper(): Promise<Job[]> {
  try {
    const res = await axios.get<string>(
      'https://weworkremotely.com/categories/remote-product-jobs.rss',
      { timeout: 12000, responseType: 'text' }
    );

    const items = splitItems(res.data);

    return items
      .map(item => {
        const rawTitle = xmlTag(item, 'title');
        const { company, title } = parseTitle(rawTitle);
        const region = xmlTag(item, 'region');
        const pubDate = xmlTag(item, 'pubDate');
        const link = xmlTag(item, 'link') || xmlTag(item, 'guid');
        const descHtml = xmlTag(item, 'description');

        const descText = htmlToText(descHtml);
        const reqMatch = descText.match(
          /(?:requirements?|qualifications?|what you.ll need)[:\s]+([\s\S]{50,1000}?)(?:\n\n|$)/i
        );

        const postedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
        const location = region || 'Remote';
        const isRemote = /remote|anywhere|worldwide|global/i.test(location);

        return {
          id: `wwr-${link.split('/').pop() || rawTitle.replace(/\s+/g, '-').toLowerCase()}`,
          atsSource: 'weworkremotely' as const,
          title,
          company,
          location,
          isRemote,
          postedAt,
          daysSincePosted: daysSince(postedAt),
          salaryRaw: null,
          salaryMin: null,
          salaryMax: null,
          applyUrl: link,
          industry: null,
          companyDescription: null,
          descriptionText: descText ? trimAtBoundary(descText, 3000) : null,
          requirements: reqMatch ? trimAtBoundary(reqMatch[1].trim(), 1200) : null,
        };
      })
      .filter(j => j.company && isPMRole(j.title));
  } catch {
    return [];
  }
}
