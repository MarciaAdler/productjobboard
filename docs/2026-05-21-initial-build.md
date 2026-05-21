# Initial Build — 2026-05-21

## What was built

A full-stack Product Manager job board that aggregates live job postings from ATS platforms across the web. The app runs at `localhost:3000` via `npm run dev`.

### Features delivered

- **Live job aggregation** from 5 ATS APIs (Greenhouse, Lever, Ashby, SmartRecruiters, Workable) across ~55 seed companies
- **Job cards** showing title, company, location, days since posted, salary (when available), and ATS source badge
- **Expandable job drawer** with company description, key requirements, full description, and an Apply link
- **Search** by title or company name (debounced, 300ms)
- **Date filter** pills: All / Today / Last 7 days / Last 30 days
- **Loading skeletons** for perceived performance
- **Server-side cache** with 30-minute TTL, warmed on startup

## Technical choices and rationale

### React + Vite over Create React App
Vite has significantly faster HMR and cold start. CRA is deprecated. No reason to use it for a new project.

### Express backend, not edge functions / serverless
The scraper fans out to 50+ HTTP requests on cache miss. That latency profile doesn't fit serverless cold starts. An always-on Express process with a warm in-memory cache handles it cleanly.

### In-memory cache, not Redis or SQLite
~500 jobs at ~2KB each = ~1MB in memory. For a dev/MVP, a module-level object is sufficient and has zero setup cost. Swap to PostgreSQL when user accounts or job alerts are added.

### tsx watch for the server dev loop
`tsx watch` handles TypeScript natively without a separate compile step. Faster than `nodemon + tsc` and simpler than `ts-node-dev`.

### npm workspaces over a monorepo tool (Turborepo, Nx)
Two packages (client, server) don't justify a build orchestration tool. npm workspaces give shared `node_modules` and a single `npm install`.

### Vite proxy for /api
Avoids CORS configuration in development. The React app calls `/api/jobs` and Vite proxies it to `localhost:3001`. In production, an nginx upstream or CDN routing rule does the same job.

### ATS scraper tier system
Three tiers: full implementation (Greenhouse, Lever, Ashby), partial (SmartRecruiters, Workable), and placeholder for platforms requiring auth/JS rendering. This made it possible to ship something real without getting blocked on the hard-to-scrape platforms.

### PM title filtering with regex, server-side
Filtering for product roles happens on the server after fetching company job boards. The regex covers the realistic surface area of PM title variations without being so loose it pulls in unrelated roles.

### All state in App.tsx, no Redux
Three UI state variables (search, dateFilter, selectedJob) plus the jobs array from the hook. `useMemo` handles derived filtering. There is no state that needs to be shared across unrelated subtrees — a global store would be over-engineering.

### Salary shown only when structured data exists
Only Lever returns structured salary ranges. Displaying partially-extracted salary from HTML would be unreliable. The decision was to show salary only when it's clean data, and show nothing otherwise.

## Seed companies

Seed company lists live in `server/src/constants/companies.ts`. This is the primary knob for expanding job coverage — adding a valid ATS slug to the appropriate list immediately expands the data set on the next cache refresh.

Companies were chosen to represent a mix of well-known product-focused tech companies known to use each respective ATS platform.

## Known limitations

- **Coverage depends on seed list size**: Only companies explicitly listed in `companies.ts` are queried. The ATS platforms don't expose a global "all companies" API.
- **10 of 15 ATS platforms are placeholders**: BambooHR, Workday, Jobvite, iCIMS, JazzHR, UltiPro, ADP, SuccessFactors, Pinpoint, and Manatal all require authentication, subscription keys, or JS rendering and are not implemented in this build.
- **Salary data is sparse**: Only Lever exposes structured compensation. Most roles will show no salary.
- **No persistence**: Jobs are cached in memory. Server restart clears the cache, triggering a fresh scrape.
- **Rate limiting**: No rate limiting is applied to outbound requests per ATS domain. High-volume runs could trigger 429s. A concurrency limiter (p-limit) would mitigate this.
