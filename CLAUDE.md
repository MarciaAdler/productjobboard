# ProductJobs

A professional Product Manager job board that aggregates live PM roles from 11 sources, filtered to US + global remote, and presented in a polished, branded interface.

## What it does

- Aggregates PM jobs from Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Workday, Remotive, RemoteOK, The Muse, Recruitee, and Personio
- Filters to US + remote only — non-US roles excluded server-side
- Salary shown on every card — "Salary not listed" when undisclosed
- Sub-24h time badges: minutes → hours → days → months (color-coded by freshness)
- Click any card for a detail drawer: company summary, requirements, salary chip, Apply button
- Location filter (dynamic, from actual job data), date filter, search by title/company
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
│   ├── public/favicon.svg    # Brand favicon
│   └── src/
│       ├── components/       # Header, JobCard, JobDrawer, DateFilter,
│       │                     # LocationFilter, SearchBar, Skeleton, EmptyState
│       ├── hooks/            # useJobs (hourly auto-refresh)
│       ├── utils/            # dateHelpers, salary formatting, ATS labels
│       └── types/            # Job interface + AtsSource union
└── server/                   # Express API (port 3002)
    └── src/
        ├── scrapers/         # One file per ATS source (11 active + Getro stub)
        ├── routes/           # /api/jobs, /api/health
        ├── cache/            # In-memory TTL cache (30 min)
        └── utils/            # filterPM, filterUS, htmlToText, normalizeJob
```

## ATS source coverage

| Source | Status | Notes |
|---|---|---|
| Greenhouse | ✅ Active | 47 seed companies |
| Lever | ✅ Active | 18 seed companies, salary when listed |
| Ashby | ✅ Active | 25 companies + structured compensation |
| SmartRecruiters | ✅ Active | Company description + qualifications |
| Workable | ✅ Active | Widget API |
| Workday | ✅ Active | Full job details fetched per-role |
| Remotive | ✅ Active | Remote product-management category |
| RemoteOK | ✅ Active | Structured salary min/max |
| The Muse | ✅ Active | US-filtered, last 90 days |
| Recruitee | ✅ Active | European companies |
| Personio | ✅ Active | XML feed with full descriptions |
| Getro (VC boards) | 🔒 Needs API key | Insight Partners, Techstars, Primary VC |
| Consider (VC boards) | 🔒 Needs Playwright | a16z, Sequoia |

## Expanding coverage

Add company slugs to `server/src/constants/companies.ts`. Each valid Greenhouse / Lever / Ashby slug adds more jobs on the next cache refresh. For Workday, both `tenant` and `board` must match exactly.

## Design system

- **Primary color:** `brand-600` = `#7c3aed` (violet)
- **Font:** Inter (Google Fonts CDN)
- **Card selected state:** violet left accent bar + `ring-1 ring-brand-300`
- **Status badges:** emerald (< 24h) → brand-violet (< 7d) → slate (older)
- **Salary:** emerald chip with dollar icon when data exists
- **Drawer backdrop:** `bg-slate-900/30 backdrop-blur-[2px]`

## Next steps

See `PLAN.md` for the full roadmap. Top priorities:

1. **Deploy** — add a Dockerfile or Railway/Render config; serve `client/dist/` from Express in production
2. **Getro API key** — unlocks Insight Partners (11k jobs) and Techstars (6k jobs) VC boards
3. **Saved jobs + email alerts** — requires user accounts (start with localStorage for saved jobs)
4. **Salary range filter** — slider over `salaryMin`/`salaryMax` (data already present for 52 roles)
