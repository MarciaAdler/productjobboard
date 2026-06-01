# Product Job Board

Aggregates open Product Manager roles from 11 live sources and displays them in a searchable, filterable job board. Jobs are filtered to US-based and global remote positions only.

## What it does

- Pulls PM jobs from 11 live sources: Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Workday, Recruitee, Personio, Remotive, RemoteOK, and The Muse
- Includes portfolio companies from a16z (Databricks), Sequoia (Instacart), and Primary VC (Justworks) via their ATS boards
- Filters to US + global remote roles — non-US locations excluded
- Shows salary on every card ("Salary not listed" when not disclosed)
- Sub-24h precision on time badges: minutes → hours → days → months
- Click any job to expand a drawer with company description, requirements, and an Apply button
- Filter by posting age (All / Today / Last 7 days / Last 30 days) and by location
- Search by title or company name
- Server cache refreshes every 30 min; client re-fetches every hour

## How to run

```bash
npm install
npm run dev
```

Opens at **http://localhost:3000**. Backend API on port 3002 (proxied via Vite).

Force a cache refresh:
```
http://localhost:3002/api/jobs?refresh=true
```

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, tsx (watch mode) |
| HTTP | axios, node-html-parser |
| Dev runner | concurrently |

## Folder structure

```
productjobboard/
├── client/               # Vite + React (port 3000)
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # useJobs (hourly auto-refresh)
│       ├── api/          # fetch wrappers
│       ├── utils/        # date, salary, ATS labels
│       └── types/        # Job interface
└── server/               # Express API (port 3002)
    └── src/
        ├── scrapers/     # One scraper per source
        ├── routes/       # /api/jobs, /api/health
        ├── cache/        # In-memory TTL cache (30 min)
        ├── utils/        # filterPM, filterUS, htmlToText, normalizeJob
        └── constants/    # Seed company lists per ATS
```

## Source coverage

| Source | Status | Notes |
|---|---|---|
| Greenhouse | Active | 47 seed companies incl. a16z/Sequoia/Primary VC portfolio |
| Lever | Active | 18 seed companies |
| Ashby | Active | 25 seed companies, structured compensation |
| SmartRecruiters | Active | REST API |
| Workable | Active | Widget API |
| Workday | Active | POST search API, 5 enterprise companies |
| Remotive | Active | Remote-only public API |
| RemoteOK | Active | Remote-only, structured salary |
| The Muse | Active | US-filtered, last 90 days |
| Getro (VC boards) | Blocked | Insight Partners/Techstars/Primary VC — requires auth |
| Consider (VC boards) | Blocked | a16z/Sequoia — JS SPA, no public API |
| BambooHR | Planned | No public JSON API |
| Jobvite | Planned | Requires API key |
| Others | Planned | Auth required |

## VC portfolio coverage

| VC Firm | Approach | Companies |
|---|---|---|
| a16z | Direct ATS | Databricks (Greenhouse) |
| Sequoia | Direct ATS | Instacart (Greenhouse) |
| Primary VC | Direct ATS | Justworks (Greenhouse) |
| Insight Partners | Getro (blocked) | Auth required |
| Techstars | Getro (blocked) | Auth required |
| Pear VC | No board found | — |
| Boost VC | No board found | — |

## API endpoints

- `GET /api/jobs` — `Job[]`, US/remote only, newest first
- `GET /api/jobs?refresh=true` — bust cache and re-scrape
- `GET /api/jobs/:id` — single job
- `GET /api/health` — cache status + job count

## Growing coverage

Add company slugs to `server/src/constants/companies.ts`. Each valid Greenhouse/Lever/Ashby slug returns more jobs on the next cache refresh. To unlock Getro VC boards, a Getro API key is needed (register at getro.com).

## What's coming next

- Getro API integration (needs API key for Insight Partners, Techstars, Primary VC boards)
- Playwright scraper for Consider boards (a16z, Sequoia)
- More VC portfolio company slugs
- Email/Slack alerts for new matches
- Saved jobs (requires user accounts)
- Salary range filter
