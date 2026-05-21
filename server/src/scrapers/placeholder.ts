import { Job } from '../types/job';
import { AtsSource } from '../types/job';

const COMING_SOON: AtsSource[] = [
  'bamboohr',
  'workday',
  'jobvite',
  'icims',
  'jazzhr',
  'ultipro',
  'adp',
  'successfactors',
  'pinpoint',
  'manatal',
];

export async function placeholderScraper(): Promise<Job[]> {
  COMING_SOON.forEach(source => {
    console.log(`[scraper] ${source}: coming soon — requires auth or JS rendering`);
  });
  return [];
}
