// Greenhouse: boards-api.greenhouse.io/v1/boards/{slug}/jobs
export const GREENHOUSE_COMPANIES = [
  'stripe', 'squarespace', 'airtable', 'intercom', 'dropbox',
  'duolingo', 'brex', 'coinbase', 'discord', 'robinhood',
  'plaid', 'lattice', 'gusto', 'figma', 'amplitude',
  // additional verified slugs
  'airbnb', 'twilio', 'okta', 'pagerduty', 'faire',
  'contentful', 'typeform', 'cloudflare', 'datadoghq', 'boxinc',
  'braze', 'samsara', 'mixpanel', 'asana', 'n26',
];

// Lever: api.lever.co/v0/postings/{slug}?mode=json
export const LEVER_COMPANIES = [
  'wealthfront', 'carta', 'benchling', 'netlify', 'replit',
  'mercury', 'retool', 'census', 'secureframe', 'runway',
  'vanta', 'dbt-labs', 'hightouch', 'watershed', 'mistral',
  'productboard', 'hotjar', 'gem',
];

// Ashby: api.ashbyhq.com/posting-api/job-board/{slug}
export const ASHBY_COMPANIES = [
  'notion', 'linear', 'ramp', 'deel', 'supabase',
  'attio', 'liveblocks', 'resend', 'trigger', 'cal',
  'rows', 'novu', 'raycast', 'vercel', 'clerk',
  // additional verified slugs
  'harvey', 'perplexity', 'cohere', 'cursor', 'anyscale',
  'plaid', 'workos', 'zapier',
];

// SmartRecruiters: api.smartrecruiters.com/v1/companies/{slug}/postings
export const SMARTRECRUITERS_COMPANIES = [
  'SmartRecruiters', 'Zalando',
];

// Workable: apply.workable.com/api/v1/widget/accounts/{slug}
export const WORKABLE_COMPANIES = [
  'sentry', 'surveymonkey', 'skyscanner', 'primer-api', 'thoughtmachine',
];

// Workday: POST https://{tenant}.{wdServer}.myworkdayjobs.com/wday/cxs/{tenant}/{board}/jobs
export interface WorkdayCompany {
  tenant: string;
  wdServer: string;
  board: string;
  displayName: string;
}

export const WORKDAY_COMPANIES: WorkdayCompany[] = [
  { tenant: 'salesforce', wdServer: 'wd12', board: 'External_Career_Site', displayName: 'Salesforce' },
  { tenant: 'adobe', wdServer: 'wd5', board: 'external_experienced', displayName: 'Adobe' },
  { tenant: 'capitalone', wdServer: 'wd12', board: 'Capital_One', displayName: 'Capital One' },
  { tenant: 'workday', wdServer: 'wd5', board: 'Workday', displayName: 'Workday' },
  { tenant: 'zendesk', wdServer: 'wd1', board: 'zendesk', displayName: 'Zendesk' },
];

// Recruitee: {slug}.recruitee.com/api/offers/
export const RECRUITEE_COMPANIES = [
  'bunq', 'betty-blocks', 'cm', 'trusted-shops',
];

// Personio: {slug}.jobs.personio.{tld}/search.json
export interface PersonioCompany {
  slug: string;
  tld: 'de' | 'com';
  displayName: string;
}

export const PERSONIO_COMPANIES: PersonioCompany[] = [
  { slug: 'vivid', tld: 'com', displayName: 'Vivid Money' },
  { slug: 'spryker', tld: 'de', displayName: 'Spryker' },
  { slug: 'personio', tld: 'de', displayName: 'Personio' },
];
