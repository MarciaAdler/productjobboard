# Product Job Board

Aggregates open Product Manager roles from 15 ATS platforms and displays them in a searchable, filterable job board.

## What it does

- Scrapes PM job listings from Greenhouse, Lever, Ashby, SmartRecruiters, and Workable (live APIs)
- Shows title, company, location, days since posted, and salary when available
- Click any job to expand a side drawer with company description, requirements, and an Apply link
- Filter by posting age (All / Today / Last 7 days / Last 30 days)
- Search by job title or company name
- Server-side cache with 30-minute TTL — first request warms the cache on startup

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
│       ├── hooks/        # useJobs fetch hook
│       ├── api/          # fetch wrappers
│       ├── utils/        # date helpers, salary formatting
│       └── types/        # Job interface
└── server/               # Express API (port 3001)
    └── src/
        ├── scrapers/     # Per-ATS job scrapers
        ├── routes/       # /api/jobs, /api/health
        ├── cache/        # In-memory TTL cache
        ├── utils/        # filterPM, htmlToText, normalizeJob
        └── constants/    # Seed company lists
```

## ATS coverage

| Platform | Status | Notes |
|---|---|---|
| Greenhouse | Active | REST API, ~20 seed companies |
| Lever | Active | REST API, ~15 seed companies |
| Ashby | Active | REST API, ~15 seed companies |
| SmartRecruiters | Active | REST API, includes company/qualifications sections |
| Workable | Active | Widget API, ~5 seed companies |
| BambooHR | Coming soon | Per-company auth required |
| Workday | Coming soon | JS rendering required |
| Jobvite | Coming soon | No public API |
| iCIMS | Coming soon | Enterprise auth |
| JazzHR | Coming soon | Partner API key required |
| UltiPro | Coming soon | Enterprise SSO |
| ADP | Coming soon | Auth required |
| SuccessFactors | Coming soon | SAP OAuth |
| Pinpoint | Coming soon | No public API |
| Manatal | Coming soon | Subscription key required |

## API endpoints

- `GET /api/jobs` — returns `Job[]`, sorted newest first
- `GET /api/jobs?refresh=true` — bust cache and re-scrape
- `GET /api/jobs/:id` — single job by id
- `GET /api/health` — cache status + job count

## What's coming next

- Add more seed companies to each ATS (biggest lever for more jobs)
- Email/Slack alerts for new job matches
- Saved jobs / bookmarks (requires user accounts)
- BambooHR and Workday scrapers via Playwright
- Job deduplication across ATS sources when the same role appears on multiple platforms
- Salary normalization and range filtering
