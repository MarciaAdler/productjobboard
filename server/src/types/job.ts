export type AtsSource =
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'smartrecruiters'
  | 'workable'
  | 'workday'
  | 'recruitee'
  | 'personio'
  | 'remotive'
  | 'remoteok'
  | 'themuse'
  | 'getro'
  | 'bamboohr'
  | 'jobvite'
  | 'icims'
  | 'jazzhr'
  | 'ultipro'
  | 'adp'
  | 'successfactors'
  | 'pinpoint'
  | 'manatal'
  | 'rippling';

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
