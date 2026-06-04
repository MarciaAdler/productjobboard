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
  'mozn ai': 'AI / ML',
  valkyrie: 'AI / ML',
  tavernresearch: 'AI / ML',
  'dropzone ai': 'AI / ML',
  harvey: 'AI / ML',
  'tavern research': 'AI / ML',

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
  measurabljobs: 'Analytics',
  measurabl: 'Analytics',
  sleuth: 'Analytics',

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
  'supernova technology': 'FinTech',
  supernova: 'FinTech',
  torus: 'FinTech',
  bettercomp: 'FinTech',
  'the guarantors': 'FinTech',

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

  // Cybersecurity
  okta: 'Cybersecurity',
  secureframe: 'Cybersecurity',
  vanta: 'Cybersecurity',
  'singularity defense': 'Cybersecurity',
  legitscript: 'Cybersecurity',

  // Infrastructure / DevOps
  cloudflare: 'Infrastructure',
  pagerduty: 'Infrastructure',
  datadog: 'Infrastructure',
  samsara: 'Infrastructure',
  'forterra systems': 'Infrastructure',
  forterra: 'Infrastructure',
  'd-wave': 'Infrastructure',
  'd-wave quantum': 'Infrastructure',

  // HR Tech
  lattice: 'HR Tech',
  gusto: 'HR Tech',
  deel: 'HR Tech',
  gem: 'HR Tech',
  justworks: 'HR Tech',
  rippling: 'HR Tech',

  // Productivity / SaaS
  airtable: 'SaaS',
  intercom: 'SaaS',
  dropbox: 'SaaS',
  asana: 'Productivity',
  notion: 'Productivity',
  productboard: 'SaaS',
  zapier: 'SaaS',
  typeform: 'SaaS',
  contentful: 'SaaS',
  attio: 'SaaS',
  squarespace: 'SaaS',
  hqo: 'SaaS',
  rebrandly: 'SaaS',
  'use origin': 'SaaS',
  origin: 'SaaS',
  campspot: 'SaaS',
  qu: 'SaaS',
  shipium: 'Logistics',
  fieldpulse: 'SaaS',
  linxup: 'SaaS',
  appriss: 'SaaS',
  'appriss retail': 'SaaS',
  coenterprise: 'SaaS',
  meddicc: 'SaaS',

  // Consumer / Social
  discord: 'Consumer',
  reddit: 'Consumer',
  pinterest: 'Consumer',
  airbnb: 'Consumer',
  lyft: 'Consumer',
  duolingo: 'EdTech',
  chess: 'Consumer',
  'chess.com': 'Consumer',
  turtlebox: 'Consumer',
  kick: 'Consumer',
  'liquid death': 'Consumer',
  liquiddeath: 'Consumer',
  moon: 'Consumer',

  // E-commerce / Marketplace
  instacart: 'E-commerce',
  faire: 'E-commerce',
  havenlybrands: 'E-commerce',
  havenly: 'E-commerce',
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

  // EdTech
  'everyday speech': 'EdTech',

  // Climate Tech
  watershed: 'Climate Tech',
  'rewiring america': 'Climate Tech',
  'radian generation': 'Climate Tech',

  // Media
  'create music group': 'Media',
  createmusicgroup: 'Media',
  workweek: 'Media',
  tixr: 'Media',
  'the information': 'Media',

  // Logistics / Supply Chain
  veryable: 'Logistics',
  routeware: 'Logistics',

  // BioTech
  benchling: 'BioTech',
};

export function getIndustry(companyName: string): string | null {
  const key = companyName.toLowerCase().trim();
  if (INDUSTRY_MAP[key]) return INDUSTRY_MAP[key];
  // Partial match for multi-word names (e.g. "Lemonaid Health" → "lemonaid health")
  for (const [mapKey, industry] of Object.entries(INDUSTRY_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return industry;
  }
  return null;
}
