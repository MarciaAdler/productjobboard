// Maps lowercase company display names to industry strings.
// Lookup: job.company.toLowerCase() → industry.
const INDUSTRY_MAP: Record<string, string> = {
  // AI / ML
  anthropic: 'AI / ML',
  openai: 'AI / ML',
  cohere: 'AI / ML',
  perplexity: 'AI / ML',
  mistral: 'AI / ML',
  cursor: 'AI / ML',
  anyscale: 'AI / ML',
  'scale ai': 'AI / ML',
  scaleai: 'AI / ML',
  weaviate: 'AI / ML',
  harvey: 'AI / ML',
  'tavern research': 'AI / ML',
  tavernresearch: 'AI / ML',
  'mozn ai': 'AI / ML',
  'dropzone ai': 'AI / ML',
  valkyrie: 'AI / ML',

  // Analytics / Data
  amplitude: 'Analytics',
  mixpanel: 'Analytics',
  hotjar: 'Analytics',
  'dbt labs': 'Analytics',
  hightouch: 'Analytics',
  census: 'Analytics',
  databricks: 'Analytics',
  'grafana labs': 'Analytics',
  grafanalabs: 'Analytics',
  measurabl: 'Analytics',
  sleuth: 'Analytics',
  looker: 'Analytics',
  heap: 'Analytics',
  fullstory: 'Analytics',

  // Enterprise SaaS / CRM
  salesforce: 'Enterprise SaaS',
  hubspot: 'Enterprise SaaS',
  zendesk: 'Enterprise SaaS',
  servicenow: 'Enterprise SaaS',
  adobe: 'Enterprise SaaS',
  box: 'Enterprise SaaS',
  'box inc': 'Enterprise SaaS',
  braze: 'Enterprise SaaS',
  intercom: 'Enterprise SaaS',
  productboard: 'Enterprise SaaS',
  contentful: 'Enterprise SaaS',
  typeform: 'Enterprise SaaS',
  attio: 'Enterprise SaaS',
  squarespace: 'Enterprise SaaS',

  // HR Tech
  workday: 'HR Tech',
  smartrecruiters: 'HR Tech',
  lattice: 'HR Tech',
  gusto: 'HR Tech',
  deel: 'HR Tech',
  gem: 'HR Tech',
  justworks: 'HR Tech',
  rippling: 'HR Tech',
  bettercomp: 'HR Tech',
  'bamboo hr': 'HR Tech',
  bamboohr: 'HR Tech',
  greenhouse: 'HR Tech',
  lever: 'HR Tech',

  // FinTech
  stripe: 'FinTech',
  brex: 'FinTech',
  coinbase: 'Crypto / Web3',
  robinhood: 'FinTech',
  plaid: 'FinTech',
  wealthfront: 'FinTech',
  carta: 'FinTech',
  mercury: 'FinTech',
  ramp: 'FinTech',
  n26: 'FinTech',
  runway: 'FinTech',
  'capital one': 'FinTech',
  'supernova technology': 'FinTech',
  supernova: 'FinTech',
  torus: 'FinTech',
  'the guarantors': 'FinTech',
  secfi: 'FinTech',
  chime: 'FinTech',
  affirm: 'FinTech',
  klarna: 'FinTech',
  marqeta: 'FinTech',

  // Developer Tools
  figma: 'Developer Tools',
  twilio: 'Developer Tools',
  netlify: 'Developer Tools',
  replit: 'Developer Tools',
  retool: 'Developer Tools',
  vercel: 'Developer Tools',
  supabase: 'Developer Tools',
  linear: 'Developer Tools',
  clerk: 'Developer Tools',
  resend: 'Developer Tools',
  workos: 'Developer Tools',
  novu: 'Developer Tools',
  raycast: 'Developer Tools',
  liveblocks: 'Developer Tools',
  'trigger.dev': 'Developer Tools',
  'cal.com': 'Developer Tools',
  rows: 'Developer Tools',
  gitlab: 'Developer Tools',
  'cockroach labs': 'Developer Tools',
  cockroachlabs: 'Developer Tools',
  'temporal technologies': 'Developer Tools',
  temporaltechnologies: 'Developer Tools',
  github: 'Developer Tools',
  atlassian: 'Developer Tools',
  hashicorp: 'Developer Tools',
  postman: 'Developer Tools',

  // Cybersecurity
  okta: 'Cybersecurity',
  secureframe: 'Cybersecurity',
  vanta: 'Cybersecurity',
  'singularity defense': 'Cybersecurity',
  legitscript: 'Cybersecurity',
  crowdstrike: 'Cybersecurity',
  sentinelone: 'Cybersecurity',
  lacework: 'Cybersecurity',

  // Infrastructure / DevOps
  cloudflare: 'Infrastructure',
  pagerduty: 'Infrastructure',
  datadog: 'Infrastructure',
  samsara: 'Infrastructure',
  forterra: 'Infrastructure',
  'd-wave quantum': 'Infrastructure',
  'new relic': 'Infrastructure',

  // Productivity
  airtable: 'Productivity',
  dropbox: 'Productivity',
  asana: 'Productivity',
  notion: 'Productivity',
  zapier: 'Productivity',
  hqo: 'Productivity',
  rebrandly: 'Productivity',
  origin: 'Productivity',
  campspot: 'SaaS',

  // SaaS (vertical / other)
  fieldpulse: 'SaaS',
  linxup: 'SaaS',
  'appriss retail': 'SaaS',
  appriss: 'SaaS',
  coenterprise: 'SaaS',
  meddicc: 'SaaS',
  qu: 'SaaS',

  // Consumer / Social
  discord: 'Consumer',
  reddit: 'Consumer',
  pinterest: 'Consumer',
  airbnb: 'Consumer',
  lyft: 'Consumer',
  chess: 'Consumer',
  'chess.com': 'Consumer',
  turtlebox: 'Consumer',
  kick: 'Consumer',
  moon: 'Consumer',
  'liquid death': 'Consumer',

  // E-commerce / Marketplace
  instacart: 'E-commerce',
  faire: 'E-commerce',
  havenly: 'E-commerce',
  havenlybrands: 'E-commerce',
  zalando: 'E-commerce',
  shopify: 'E-commerce',

  // Real Estate / PropTech
  rentspree: 'Real Estate',
  closinglock: 'Real Estate',
  'just appraised': 'Real Estate',

  // HealthTech
  'solv health': 'HealthTech',
  solv: 'HealthTech',
  'lemonaid health': 'HealthTech',
  lemonaid: 'HealthTech',
  patientnow: 'HealthTech',
  'eleanor health': 'HealthTech',
  wellright: 'HealthTech',
  teladoc: 'HealthTech',
  hims: 'HealthTech',

  // EdTech
  duolingo: 'EdTech',
  'everyday speech': 'EdTech',
  coursera: 'EdTech',
  masterclass: 'EdTech',

  // Climate Tech
  watershed: 'Climate Tech',
  'rewiring america': 'Climate Tech',
  'radian generation': 'Climate Tech',

  // Media / Entertainment
  'create music group': 'Media',
  createmusicgroup: 'Media',
  workweek: 'Media',
  tixr: 'Media',
  'the information': 'Media',
  spotify: 'Media',
  'warner music': 'Media',
  buzzfeed: 'Media',

  // Logistics / Supply Chain
  veryable: 'Logistics',
  routeware: 'Logistics',
  shipium: 'Logistics',

  // BioTech
  benchling: 'BioTech',
};

export function getIndustry(companyName: string): string | null {
  const key = companyName.toLowerCase().trim();
  if (INDUSTRY_MAP[key]) return INDUSTRY_MAP[key];
  // Partial match — handles slight name variants (e.g. "Grafana Labs" → "grafana labs")
  for (const [mapKey, industry] of Object.entries(INDUSTRY_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return industry;
  }
  return null;
}
