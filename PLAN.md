# ProductJobs — Project Plan

## What We Built

A full-stack Product Manager job board that aggregates live PM roles from 11 sources and presents them in a searchable, filterable, professional-quality interface.

**Tech stack:** React 18 + Vite + TypeScript + Tailwind CSS (client) · Node.js + Express + TypeScript (server)  
**Runs at:** `localhost:3000` via `npm run dev`  
**Data:** ~515 US/remote PM jobs refreshed every 30 minutes server-side, re-fetched by the client every hour

### Data sources (11 active)
| Source | Type | Notes |
|---|---|---|
| Greenhouse | ATS REST API | 47 seed companies — largest source |
| Ashby | ATS REST API | 25 companies, structured compensation |
| Workday | POST search API | 5 enterprise companies (Salesforce, Adobe, etc.) |
| RemoteOK | Public API | Remote-only, structured salary min/max |
| The Muse | Public API | US-filtered, last 90 days |
| Lever | ATS REST API | 18 companies |
| SmartRecruiters | REST API | Company + qualifications sections |
| Remotive | Public API | Remote product management roles |
| Workable | Widget API | 5 seed companies |
| Recruitee | Public API | European companies |
| Personio | XML feed | European companies, full descriptions |

### VC portfolio companies included
Databricks (a16z), Instacart (Sequoia), Justworks (Primary VC) — via their Greenhouse boards

### UI features
- Search by title or company (debounced 300ms)
- Location filter — dropdown built from actual job data, top 12 cities
- Date filter — segmented control (All / Today / 7 days / 30 days)
- Job drawer — slides in from right, shows company description, requirements, salary chip, Apply CTA
- Status badges — color-coded by freshness (emerald = today, violet = this week, gray = older)
- US + remote filter applied server-side — non-US roles excluded
- Salary always shown on every card — "Salary not listed" when absent

---

## What We Improved

### Data quality
- Workday scraper: upgraded from search-only (no descriptions) to fetching individual job detail pages for every PM match, batched 5 at a time. 515/515 jobs now have full descriptions.
- Personio scraper: switched from `search.json` (empty descriptions) to the XML feed, which includes full `jobDescriptions` CDATA blocks and real `createdAt` dates.
- Ashby scraper: added `?includeCompensation=true` to extract structured salary ranges from compensation tiers.
- HTML cleanup: rewrote `htmlToText()` to decode all HTML entities, remove CSS artifact lines, and normalize whitespace — readable plain-text descriptions.
- US/remote filter: server-side post-processing removes non-US roles based on location string matching.

### Design (Ralph Loop — 3 rounds)
- **Color system:** unified to a single violet brand palette. Eliminated the 3-color incoherence (indigo + teal + emerald used randomly).
- **Typography:** Inter via Google Fonts, font-smoothing, thin custom scrollbar.
- **Header:** "ProductJobs" wordmark with briefcase icon and live role count — no longer looks like a tutorial project.
- **Job cards:** left accent bar for selected state, location truncated to city level, "Multiple locations" for Workday multi-office roles, Remote badge in brand violet, ATS source de-emphasized.
- **Filter bar:** DateFilter converted to segmented control pattern. LocationFilter gets pin icon + chevron. SearchBar shares focus ring style.
- **Drawer:** backdrop blur, MetaChip components for metadata, section dividers, emerald salary chip with dollar icon, revised Apply CTA with brand shadow.
- **EmptyState:** new component with context-aware messaging (search miss vs filter miss) and "Clear filters" shortcut.
- **Error state:** icon + two-level message instead of a bare red text block.

---

## Future Roadmap

### Deploy to live site
- Add a `Dockerfile` or `railway.toml` / `render.yaml` for one-click deploy
- Configure environment variable for `PORT` (server already reads `process.env.PORT`)
- Serve the Vite `client/dist/` from Express in production mode (single `npm start`)
- Add a custom domain (e.g. `productjobs.io`)

### Expand job coverage
- **Getro API** — register at getro.com for API key to unlock Insight Partners (11k jobs), Techstars (6k jobs), Primary VC boards. Scraper is written and waiting for the key.
- **Consider boards** — a16z and Sequoia use the Consider platform (JS-rendered SPA). Implement Playwright scraping.
- **More ATS seed companies** — each valid Greenhouse/Lever/Ashby slug immediately adds more jobs on the next cache refresh.
- **Hacker News "Who is Hiring"** — the monthly thread (first Monday) is a rich source of PM roles from startups. Scraper not yet implemented.

### User features
- **Saved jobs** — bookmark roles locally (localStorage) or with a user account
- **Email alerts** — "notify me when a new PM role at [company] is posted"
- **Salary filter** — slider UI over the structured `salaryMin`/`salaryMax` fields (data already present for 52 jobs)
- **Company filter** — filter to a specific company across sources
- **Role level filter** — IC (PM, Senior PM) vs. Manager (Director, VP, CPO)

### Data & infrastructure
- **SQLite/PostgreSQL persistence** — replace in-memory cache so job history is retained across restarts and historical trending is possible
- **Deduplication improvement** — some roles appear on multiple ATS boards if a company migrated. Current `title + company` dedup helps but isn't perfect.
- **Refresh webhook** — instead of a fixed 30-min interval, trigger scrapes via a GitHub Actions cron
- **Salary normalization** — extract salary from HTML descriptions for sources where it's embedded but not structured (Greenhouse, The Muse)
