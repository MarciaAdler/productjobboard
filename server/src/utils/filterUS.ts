import { Job } from '../types/job';

// Location substrings that indicate non-US locations.
// Checked BEFORE the US state-abbreviation regex so that e.g. "Bangalore, IN"
// is caught by "bangalore" / "india" before ", IN" (Indiana) fires.
const NON_US_TERMS = [
  // Europe (generic)
  'europe', 'european union', ' eu,', ', eu',
  // UK / Ireland
  'united kingdom', ' uk,', ', uk', 'england', 'scotland', 'wales',
  'london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'bristol', 'dublin, ireland',
  // DACH
  'germany', 'berlin', 'munich', 'hamburg', 'frankfurt', 'cologne',
  'switzerland', 'zurich', 'geneva', 'austria', 'vienna',
  // Benelux
  'netherlands', 'amsterdam', 'rotterdam', 'belgium', 'brussels',
  // Nordics
  'sweden', 'stockholm', 'denmark', 'copenhagen', 'norway', 'oslo', 'finland', 'helsinki',
  // Southern Europe
  'france', 'paris', 'spain', 'madrid', 'barcelona', 'italy', 'rome', 'milan',
  'portugal', 'lisbon',
  // Eastern Europe
  'poland', 'warsaw', 'czech', 'prague', 'hungary', 'budapest', 'romania', 'bucharest',
  // APAC
  'australia', 'sydney', 'melbourne', 'brisbane', 'perth',
  'india', 'bangalore', 'bengaluru', 'mumbai', 'hyderabad', 'pune', 'chennai', 'delhi',
  'singapore',
  'japan', 'tokyo', 'osaka',
  'south korea', 'seoul',
  'china', 'beijing', 'shanghai', 'shenzhen',
  'hong kong', 'taiwan', 'taipei',
  'new zealand', 'auckland',
  // Canada (remote-Canada roles are not US-accessible)
  'canada', 'toronto', 'vancouver', 'montreal', 'calgary', 'ottawa', 'ontario',
  'british columbia', 'alberta', 'quebec',
  // LatAm
  'brazil', 'são paulo', 'sao paulo', 'rio de janeiro',
  'argentina', 'buenos aires',
  'colombia', 'bogotá', 'bogota',
  'chile', 'santiago',
  'mexico', 'ciudad de méxico', 'cdmx',
  // Middle East
  'israel', 'tel aviv',
  'dubai', 'uae', 'abu dhabi', 'saudi arabia',
  // Africa
  'south africa', 'nigeria', 'kenya', 'nairobi',
];

// Phrases that signal a truly global/open remote role → always include.
const GLOBAL_REMOTE_RE = /\b(worldwide|global|anywhere|work from home|wfh)\b/i;
const US_SIGNAL_RE = /\b(north america|americas|united states|usa|us only|us[-\s]based)\b/i;
// US state abbreviation at end of a location component (e.g. "San Francisco, CA").
const US_STATE_RE = /,\s*(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)\b/i;

export function isUSOrRemote(job: Job): boolean {
  const loc = (job.location || '').toLowerCase();

  // Blank / generic unknown → be inclusive
  if (!loc || loc === 'unknown' || loc === 'various' || loc === 'multiple locations') return true;

  // Truly global remote signals → include regardless of country
  if (GLOBAL_REMOTE_RE.test(loc)) return true;

  // Explicit US signal → include
  if (US_SIGNAL_RE.test(loc)) return true;

  // Non-US country check — runs BEFORE the isRemote / state-abbr shortcuts so that
  // "Remote (UK)", "Remote - Canada", "Bangalore, IN" are all correctly excluded.
  for (const term of NON_US_TERMS) {
    if (loc.includes(term)) return false;
  }

  // Vague "remote" with no country specified → include
  if (job.isRemote || /\bremote\b/.test(loc)) return true;

  // US state abbreviation (e.g. "Austin, TX") → include
  if (US_STATE_RE.test(loc)) return true;

  // Default: include (better to over-include than miss valid US roles)
  return true;
}
