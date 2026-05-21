export type AtsSource =
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'smartrecruiters'
  | 'workable'
  | 'bamboohr'
  | 'workday'
  | 'jobvite'
  | 'icims'
  | 'jazzhr'
  | 'ultipro'
  | 'adp'
  | 'successfactors'
  | 'pinpoint'
  | 'manatal';

export interface Job {
  id: string;
  atsSource: AtsSource;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  postedAt: string;
  daysSincePosted: number;
  salaryRaw: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  applyUrl: string;
  companyDescription: string | null;
  descriptionText: string | null;
  requirements: string | null;
}
