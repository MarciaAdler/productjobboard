# Product Job Board

Aggregates open Product Manager roles from ATS platforms across the web and displays them in a searchable, filterable job board.

## What it does

- Scrapes PM job listings from 8 live ATS sources: Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Workday, Recruitee, and Personio
- Shows title, company, location, time since posted, and salary when available
- Sub-24h precision on post times: shows minutes or hours ago, not just "Today"
- Click any job to expand a side drawer with company description, requirements, and an Apply link
- Filter by posting age (All / Today / Last 7 days / Last 30 days)
- Filter by location — dropdown dynamically built from loaded jobs
- Search by job title or company name
- Server-side cache with 30-minute TTL, warmed on startup; client re-fetches every hour

## How to run

```bash
npm install
npm run dev
```

Opens at **http://localhost:3000**. The backend API runs on port 3002 (proxied via Vite).

To force a cache refresh during development:
```
http://localhost:3002/api/jobs?refresh=true
```

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, tsx (watch mode) |
| HTTP client | axios |
| HTML parsing | node-html-parser |
| Dev runner | concurrently |

## Folder structure

```
productjobboard/
├── client/               # Vite + React app (port 3000)
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # useJobs fetch hook (hourly auto-refresh)
│       ├── api/          # fetch wrappers
│       ├── utils/        # date helpers, salary formatting, ATS labels
│       └── types/        # Job interface
└── server/               # Express API (port 3002)
    └── src/
        ├── scrapers/     # Per-ATS job scrapers
        ├── routes/       # /api/jobs, /api/health
        ├── cache/        # In-memory TTL cache (30 min)
        ├── utils/        # filterPM, htmlToText, normalizeJob
        └── constants/    # Seed company lists per ATS
```

## ATS coverage

| Platform | Status | Seed companies | Notes |
|---|---|---|---|
| Greenhouse | Active | 35 | REST API, largest source |
| Lever | Active | 18 | REST API, salary range when available |
| Ashby | Active | 23 | REST API, includes compensation flag |
| SmartRecruiters | Active | 2 | REST API, company/qualifications sections |
| Workable | Active | 5 | Widget API |
| Workday | Active | 5 | POST search API, enterprise companies |
| Recruitee | Active | 4 | GET API, European companies |
| Personio | Active | 3 | JSON feed, European companies |
| BambooHR | Coming soon | — | No public JSON API, HTML-only |
| Jobvite | Coming soon | — | Requires API key |
| iCIMS | Coming soon | — | Enterprise auth |
| JazzHR | Coming soon | — | Partner API key required |
| UltiPro | Coming soon | — | Enterprise SSO |
| ADP | Coming soon | — | Auth required |
| SuccessFactors | Coming soon | — | SAP OAuth |
| Pinpoint | Coming soon | — | No public API |
| Manatal | Coming soon | — | Subscription key required |

## API endpoints

- `GET /api/jobs` — returns `Job[]`, sorted newest first
- `GET /api/jobs?refresh=true` — bust cache and re-scrape
- `GET /api/jobs/:id` — single job by id
- `GET /api/health` — cache status + job count

## Expanding coverage

The fastest way to get more jobs is to add company slugs to `server/src/constants/companies.ts`. Each valid slug added to a Tier 1 ATS (Greenhouse, Lever, Ashby) immediately returns more jobs on the next cache refresh. For Workday, both the tenant name and board name must match the company's Workday setup exactly.

## What's coming next

- More seed companies across all active ATS sources
- Email/Slack alerts for new job matches
- Saved jobs / bookmarks (requires user accounts)
- BambooHR and Workday scrapers via Playwright for harder-to-reach boards
- Salary range filter
- Salary normalization (Lever structured → others extracted from HTML)
