// Greenhouse: boards-api.greenhouse.io/v1/boards/{slug}/jobs
export const GREENHOUSE_COMPANIES = [
  // Original seed
  'stripe', 'squarespace', 'airtable', 'intercom', 'dropbox',
  'duolingo', 'brex', 'coinbase', 'discord', 'robinhood',
  'plaid', 'lattice', 'gusto', 'figma', 'amplitude',
  // Added 2026-05-22
  'airbnb', 'twilio', 'okta', 'pagerduty', 'faire',
  'contentful', 'typeform', 'cloudflare', 'datadoghq', 'boxinc',
  'braze', 'samsara', 'mixpanel', 'asana', 'n26',
  // Added 2026-06-01
  'lyft', 'reddit', 'pinterest', 'gitlab', 'grafanalabs',
  'temporaltechnologies', 'cockroachlabs', 'scaleai', 'anthropic',
  // VC portfolio companies (2026-06-01) — verified slugs only
  'databricks',  // a16z portfolio
  'instacart',   // Sequoia portfolio
  'justworks',   // Primary VC portfolio
];

// Lever: api.lever.co/v0/postings/{slug}?mode=json
export const LEVER_COMPANIES = [
  'wealthfront', 'carta', 'benchling', 'netlify', 'replit',
  'mercury', 'retool', 'census', 'secureframe', 'runway',
  'vanta', 'dbt-labs', 'hightouch', 'watershed', 'mistral',
  'productboard', 'hotjar', 'gem',
];

// Ashby: api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true
export const ASHBY_COMPANIES = [
  // Original seed
  'notion', 'linear', 'ramp', 'deel', 'supabase',
  'attio', 'liveblocks', 'resend', 'trigger', 'cal',
  'rows', 'novu', 'raycast', 'vercel', 'clerk',
  // Added 2026-05-22
  'harvey', 'perplexity', 'cohere', 'cursor', 'anyscale',
  'plaid', 'workos', 'zapier',
  // Added 2026-06-01
  'openai', 'weaviate',
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
