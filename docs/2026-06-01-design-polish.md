# Design Polish — 2026-06-01

## What Ralph reviewed

The app was functional but had several "tutorial project" signals: a generic header, mixed filter UI patterns (select dropdown alongside pill buttons), an incoherent color palette (indigo + teal + emerald across different components), UPPERCASE section headers in the drawer that felt dated, no brand identity, and long untruncated location strings on cards.

## What was improved (3 rounds)

### Round 1 — Visual Foundation

**Color system unified to violet (`brand-600` = `#7c3aed`)**
- Replaced the mixed indigo/teal/emerald palette with a single violet brand palette defined in `tailwind.config.js` as a `brand` color scale
- Emerald kept *only* for salary data (money = green is a strong semantic signal — worth preserving)
- Background: `slate-50` (warmer than `gray-50`, less clinical)
- Card borders: `slate-200`, text hierarchy: `slate-900` / `slate-600` / `slate-400`

**Inter font**
- Added via Google Fonts CDN in `index.html` with `preconnect` for fast load
- Font smoothing enabled in `index.css`
- Custom scrollbar styling (`scrollbar-width: thin`) for cleaner overflow areas

**Header wordmark**
- Replaced "Product Jobs" plain text with a branded `ProductJobs` wordmark
- Violet rounded square with briefcase icon (SVG, no external dependency)
- Live job count shown in brand violet, visually prominent
- Mobile: subtitle hidden on small screens to avoid crowding

**Status badge palette**
- Fresh (< 24h): emerald green — stands out, feels "new"
- This week (< 7d): brand violet — cohesive
- This month (< 30d): slate gray — de-emphasized
- Older: lighter slate — clearly aged

**Favicon**
- Added `client/public/favicon.svg` — violet rounded square with "PJ" initials, consistent with the wordmark

### Round 2 — Card & Filter Polish

**Job card redesign**
- Added left accent bar: thin `w-1` strip, brand-violet when selected, transparent on hover → shows the card is interactive, makes selection state unmistakable
- Selected state: `ring-1 ring-brand-300` + `bg-brand-50/40` background tint (not just border color change)
- Title hover: subtly shifts to `brand-800` — signals interactivity
- Location truncated: `"San Francisco, California, United States"` → `"San Francisco, California"`
- Workday "N Locations" strings → `"Multiple locations"` (cleaner)
- Remote badge: uses `brand-50 / brand-700` (now cohesive, not a separate teal system)
- ATS source label: dropped to `slate-300` (lightest) — it's metadata, not a primary data point
- `rounded-xl` throughout for a softer, more modern feel

**Date filter — segmented control pattern**
- Replaced border-pill buttons with a segmented control: `bg-slate-100` container, active state lifts with `bg-white shadow-sm`
- This is a well-understood UI pattern — less visual noise than individual bordered buttons
- Labels shortened: "Last 7 days" → "7 days" (fits better on mobile)

**Location filter — consistent with input fields**
- Added pin icon (left-inset SVG) and chevron (right-inset SVG) so it reads as a styled input, not a naked browser select
- Same border, border-radius, and focus ring as the SearchBar — now the three filter controls feel like a family

**SearchBar**
- Focus ring updated to `brand-500` (was `indigo-500`)
- Placeholder text updated to "Search by title or company…"

### Round 3 — Drawer, Empty State & App Shell

**JobDrawer**
- Backdrop changed to `bg-slate-900/30 backdrop-blur-[2px]` — subtle frosted glass effect, more premium than a flat semi-transparent black
- Metadata display: small chips (`MetaChip` helper component) replacing inline text runs — location, remote, salary, ATS source each get their own rounded chip with appropriate color
- Salary chip: emerald with dollar icon — visually distinctive when present
- Apply CTA: `rounded-xl`, `shadow-sm shadow-brand-200` — subtle brand-toned shadow lifts the button
- No-description state: replaced generic text with an icon + two-line message
- Scrollable body uses `divide-y divide-slate-100` between sections — clean without heavy borders

**EmptyState (new component)**
- Briefcase icon in a rounded square container
- Context-aware: "No results for 'query'" vs "No jobs match your filters" depending on whether search is active
- "Clear all filters" button only appears when filters are actually active

**App shell**
- Error state: now has an icon + two-level message ("Unable to load jobs" / "Make sure the server is running")
- Results meta bar: shows "N roles" on the left, "Clear filters" link on the right (only when active)
- `max-w-5xl` (was `max-w-6xl`) — slightly narrower for better reading line length
- `px-4 sm:px-6` — proper responsive horizontal padding

## How the frontend-design skill verified quality

Verification was done through compiled asset inspection and API data probes (no headless browser available in this environment):

| Check | Result |
|---|---|
| Brand palette in CSS bundle | ✅ `#ede9fe`, `#f5f3ff`, backdrop-blur, rounded-xl all present |
| Inter font in page source | ✅ Google Fonts link + preconnect in `<head>` |
| EmptyState in JS bundle | ✅ "No results for", "Clear all filters" strings compiled |
| Location truncation logic | ✅ All 9 edge cases correct including Workday multi-location strings |
| StatusBadge color buckets | ✅ All 4 age ranges map to correct Tailwind classes |
| Data richness for drawer | ✅ 515/515 jobs have description, 268/515 have requirements, 52 have salary |
| Salary chip data | ✅ Harvey $244K–$366K, Plaid $190K–$262K confirmed in API |

**⚠️ Finding corrected post-verify:** Workday `"4 Locations"` / `"5 Locations"` strings were passing through raw to the card and drawer location fields. Fixed by detecting the pattern with `/^\d+\s+locations?$/i` and replacing with `"Multiple locations"`.

## Files changed

| File | Change type |
|---|---|
| `client/index.html` | Inter font, meta description, updated title |
| `client/public/favicon.svg` | New — brand favicon |
| `client/src/index.css` | Inter, font-smoothing, thin scrollbar |
| `client/tailwind.config.js` | Brand color scale, Inter font family, slide-in animation |
| `client/src/App.tsx` | Error state, results meta bar, clearFilters, narrower container |
| `client/src/components/Header.tsx` | Wordmark with icon, violet job count |
| `client/src/components/JobCard.tsx` | Left accent bar, location truncation, new palette |
| `client/src/components/JobDrawer.tsx` | MetaChip, backdrop blur, section dividers, new CTA |
| `client/src/components/JobList.tsx` | Passes searchQuery/hasFilters/onClearFilters to EmptyState |
| `client/src/components/EmptyState.tsx` | New component |
| `client/src/components/DateFilter.tsx` | Segmented control pattern |
| `client/src/components/LocationFilter.tsx` | Pin + chevron icons, consistent borders |
| `client/src/components/SearchBar.tsx` | Brand focus ring, better placeholder |
| `client/src/components/Skeleton.tsx` | Matches new card shape with left accent bar |
| `client/src/components/StatusBadge.tsx` | `rounded-full`, `whitespace-nowrap` |
| `client/src/utils/dateHelpers.ts` | New status badge color palette |
