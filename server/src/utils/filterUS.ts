import { Job } from '../types/job';

// Sources that are inherently global-remote — never filter
const ALWAYS_INCLUDE_SOURCES = new Set<string>(['remotive', 'remoteok']);

// Location substrings that indicate non-US locations
const NON_US_TERMS = [
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
  // LatAm
  'brazil', 'são paulo', 'sao paulo', 'rio de janeiro',
  'argentina', 'buenos aires',
  'colombia', 'bogotá', 'bogota',
  'chile', 'santiago',
  // Middle East
  'israel', 'tel aviv',
  'dubai', 'uae', 'abu dhabi', 'saudi arabia',
];

export function isUSOrRemote(job: Job): boolean {
  // Platform-level bypass: always include remote-only sources
  if (ALWAYS_INCLUDE_SOURCES.has(job.atsSource)) return true;

  // Explicitly marked remote
  if (job.isRemote) return true;

  const loc = (job.location || '').toLowerCase();

  // Unknown → be inclusive
  if (!loc || loc === 'unknown' || loc === 'various' || loc === 'multiple locations') return true;

  // Explicit remote/global signals
  if (/\b(remote|worldwide|global|anywhere|work from home|wfh)\b/.test(loc)) return true;
  if (/\b(north america|americas|united states|usa)\b/.test(loc)) return true;

  // US state abbreviation after a comma (e.g., "San Francisco, CA")
  if (/,\s*(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)\b/i.test(loc)) return true;

  // Check against non-US term list
  for (const term of NON_US_TERMS) {
    if (loc.includes(term)) return false;
  }

  // Default: include (better to over-include than drop valid US jobs)
  return true;
}
