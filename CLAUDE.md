# ProductJobs

A product job board that aggregates live product roles (PM, Designer, Analyst, Owner, etc.) from 13 sources, filtered to US + global remote, and presented in a polished, branded interface.

## What it does

- Aggregates product jobs from 13 sources (see coverage table below)
- Includes all product roles: PM, Product Designer, Product Owner, Product Analyst, Product Scientist, PMM, Product Ops, etc.
- Filters to US + remote only — non-US roles excluded server-side
- Salary shown on every card — "Salary not listed" when undisclosed
- Sub-24h time badges: minutes → hours → days → months (color-coded by freshness)
- Click any card for a detail drawer: company summary, requirements, salary chip, Apply button
- Industry tags on each job card (AI/ML, FinTech, Developer Tools, etc.) + industry filter in top bar
- Location filter, date filter, and title/company search in sticky top bar
- Server cache refreshes every 30 min; client re-fetches every hour

## How to run

```bash
npm install
npm run dev
```

Opens at **http://localhost:3000**. Backend API on port 3002 (Vite proxy).

Force cache refresh: `http://localhost:3002/api/jobs?refresh=true`  
Health check: `http://localhost:3002/api/health`

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Inter font |
| Backend | Node.js, Express, TypeScript, tsx watch |
| HTTP + parsing | axios, node-html-parser |
| Dev runner | concurrently |

## Folder structure

```
productjobboard/
├── client/                   # Vite + React (port 3000)
│   ├── public/favicon.svg
│   └── src/
│       ├── components/       # Header, JobCard, JobDrawer, DateFilter,
│       │                     # LocationFilter, IndustryFilter, SearchBar,
│       │                     # Skeleton, EmptyState
│       ├── hooks/            # useJobs (hourly auto-refresh)
│       ├── utils/            # dateHelpers, salary formatting, ATS labels
│       └── types/            # Job interface + AtsSource union
└── server/                   # Express API (port 3002)
    └── src/
        ├── scrapers/         # One file per source (13 active + Getro stub)
        ├── constants/        # companies.ts (slug lists), industries.ts (company→industry map)
        ├── routes/           # /api/jobs, /api/health
        ├── cache/            # In-memory TTL cache (30 min)
        └── utils/            # filterPM, filterUS, htmlToText, normalizeJob
```

## Source coverage

| Source | Status | Notes |
|---|---|---|
| Greenhouse | ✅ Active | 47 seed companies |
| Lever | ✅ Active | 18 seed companies, salary when listed |
| Ashby | ✅ Active | 25 companies + structured compensation |
| SmartRecruiters | ✅ Active | Company description + qualifications |
| Workable | ✅ Active | Widget API |
| Workday | ✅ Active | Full job details fetched per-role |
| Remotive | ✅ Active | Remote product category |
| RemoteOK | ✅ Active | Structured salary min/max |
| The Muse | ✅ Active | US-filtered, last 90 days |
| Recruitee | ✅ Active | European companies |
| Personio | ✅ Active | XML feed with full descriptions |
| Rippling | ✅ Active | 60+ company slugs, pay range API |
| Jobicy | ✅ Active | `tag=product&geo=usa`, salary when listed |
| We Work Remotely | ✅ Active | Product category RSS feed |
| Getro (VC boards) | 🔒 Needs API key | Insight Partners, Techstars, Primary VC |

## Expanding coverage

Add company slugs to `server/src/constants/companies.ts`. Each valid Greenhouse / Lever / Ashby / Rippling slug adds more jobs on the next cache refresh. For Workday, both `tenant` and `board` must match exactly.

To add a new global-search source (no slug list needed), create a scraper in `server/src/scrapers/` and register it in `server/src/scrapers/index.ts`.

## Industry tags

Defined in `server/src/constants/industries.ts` — a static map of `company name (lowercase) → industry string`. Applied as a post-processing pass in `scrapers/index.ts` after deduplication. Industries: AI/ML, Analytics, Enterprise SaaS, HR Tech, FinTech, Developer Tools, Cybersecurity, Infrastructure, Productivity, SaaS, Consumer, E-commerce, Real Estate, HealthTech, EdTech, Climate Tech, Media, Logistics, BioTech. Jobs from aggregator sources (The Muse, Remotive, RemoteOK, WWR, Jobicy) show industry only when the company name is in the map.

## Role filter

`server/src/utils/filterPM.ts` — catches all product roles: Product Manager, Product Designer, Product Owner, Product Analyst, Product Scientist, Product Marketing, Product Ops, and seniority-prefixed variants (Senior/Staff/Lead/Principal Product). Also matches `\bpm\b` and `\bcpo\b`.

## Location filter

`server/src/utils/filterUS.ts` — non-US terms checked before the `isRemote` short-circuit to prevent false positives like "Bangalore, IN" or "Remote (UK)". Truly global signals (`worldwide`, `global`, `anywhere`) always pass. Vague `remote` with no country specified passes.

## Job descriptions

`trimAtBoundary(text, maxLen)` in `normalizeJob.ts` cuts at the last paragraph break, sentence end, or word boundary rather than hard-slicing. Scrapers store up to 3000 chars of description and 1200 chars of requirements. The drawer summarizes these further client-side.

## Design system

- **Primary color:** `brand-600` = `#7c3aed` (violet)
- **Font:** Inter (Google Fonts CDN)
- **Card selected state:** violet left accent bar + `ring-1 ring-brand-300`
- **Status badges:** emerald (< 24h) → brand-violet (< 7d) → slate (older)
- **Salary:** emerald chip with dollar icon when data exists
- **Industry pill:** slate-100 bg, slate-500 text, next to company name on each card

## Deployment

- **Frontend:** Vercel (auto-deploys from `main`)
- **Backend:** Railway (Express API on port 3002)
- CORS configured on Railway to allow Vercel frontend origin

## Next steps

1. **Getro API key** — unlocks Insight Partners and Techstars VC boards
2. **Saved jobs** — localStorage to start, then user accounts
3. **Salary range filter** — slider over `salaryMin`/`salaryMax`
4. **Email alerts** — saved search + periodic email digest
