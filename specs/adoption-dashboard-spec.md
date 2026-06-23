# Task Mining Adoption Dashboard — Specification

> Build-ready spec for an internal adoption + commercial dashboard for Celonis Task Mining.
> Intended audience: a coding agent (Claude Code) implementing the app from scratch or extending it.

---

## 1. Overview

A single-page, statically-served web app that shows **product adoption** of Task Mining
(from Datadog telemetry) joined with **commercial data** (contract value from an Excel
contract book). It lets a product/GTM owner answer:

- How many clients and customers are actively using Task Mining?
- Which customers drive usage, and how healthy is each (errors, versions)?
- Where is contract value **not** matched by usage (churn risk) or usage **not** matched
  by contract value (expansion / unbilled)?
- Produce a periodic Slack adoption report from the same numbers.

The app is a **point-in-time snapshot**: data is baked into typed TS files by refresh
scripts, not fetched live in the browser (no backend, no secrets in the client).

---

## 2. Goals / Non-goals

### Goals
- Static, fast, dependency-light dashboard (works offline, no API at runtime).
- Faithful, reproducible metric definitions (documented Datadog queries).
- Drill-down from totals → per-customer → per-subscription.
- Join Datadog usage with the contract book by customer.
- One-command data refresh + Excel export + Slack-message generation.

### Non-goals
- No live Datadog calls from the browser.
- No authentication / multi-tenant (internal artifact).
- Not a real-time monitor (Datadog dashboards already do that; links provided).

---

## 3. Tech stack (strict)

- **Next.js (App Router)** with **static export** (`output: "export"`), images unoptimized.
- **React 19**, **TypeScript**.
- **Tailwind CSS v4** (`@tailwindcss/postcss`), shadcn-style hand-rolled UI primitives.
- **System font stack** only (no `next/font/google` — must build with no network).
- Charts are **inline SVG** (no chart library).
- Data-refresh scripts in **Python 3 standard library only** (no pandas/openpyxl).
- Constraint: **≤ 300 lines per file**; keep components small and modular.
- Served in restricted environments via `npm run build` then
  `python3 -m http.server <port> --directory out` (the Next dev server is avoided because
  it crashes on `uv_interface_addresses` in some sandboxes).

---

## 4. Data sources

### 4.1 Datadog (usage)
- Org: `celonis.datadoghq.com` (US1). Accessed via the Datadog MCP at refresh time only.
- Recorder logs: `service:task-mining`. Key attributes:
  - `@clientId` — unique recorder install (the unit of "active client").
  - `@teamDomain` — per-customer tenant slug (the join key to commercial data).
  - `@recorderVersion` — installed recorder version.
  - `status:error` — error log lines.
- Log retention ≈ 30 days → only query windows within the last ~30 days for log-based metrics.

### 4.2 Contract book (commercial)
- Excel file `Customers Task mining.xlsx`, sheet `Sheet1`. Columns:
  - `Logo Name`, `Subscription Name`, `Start Date`, `End Date` (Excel date serials),
    then **one column per month** holding the active contract value (ACV) for that month.
  - A top "Accumulated Contract value" row (cumulative signed ACV) — informational.
- One row per subscription; a logo can have several rows (renewals / multiple products).

---

## 5. Metric catalog (exact definitions)

> These are the canonical definitions the refresh scripts must implement. Window = the
> reporting period (e.g. `2026-06-01T00:00:00Z` → `2026-06-22T23:59:59Z`).

### From logs (`service:task-mining`)
| Metric | Definition (DDSQL over `logs`) |
|---|---|
| Active clients (total) | `COUNT(DISTINCT @clientId)` |
| Active teams (total) | `COUNT(DISTINCT @teamDomain)` having clients > 0 |
| Per-team clients | `COUNT(DISTINCT @clientId) GROUP BY @teamDomain` |
| Per-team versions | `COUNT(DISTINCT @recorderVersion) GROUP BY @teamDomain` |
| Per-team errors | `SUM(status='error') GROUP BY @teamDomain` |
| Version mix | `COUNT(DISTINCT @clientId) GROUP BY @recorderVersion` |
| Per-team parquet uploads | `COUNT(*)` where `message LIKE '%Uploaded%parquet%files%'` GROUP BY team |
| Per-team screenshot uploads | `COUNT(*)` where `message LIKE '%Uploaded%image%files%'` GROUP BY team |

`@clientId`, `@teamDomain`, `@recorderVersion` must be declared in `extra_columns`
(types `varchar`) when using the MCP `analyze_datadog_logs` tool.

### From metrics (server-side, scalar `sum` over window)
| Metric | Datadog metric name |
|---|---|
| Parquet files uploaded (success) | `celonis.task_mining.parquet_files_uploaded_successfully` |
| Parquet upload failures | `celonis.task_mining.parquet_files_upload_failed` |
| Uploader events (success) | `celonis.task_mining_uploader.upload_success` |
| Uploader failures | `celonis.task_mining_uploader.upload_failed2` |
| Project creations | `taskmining.project.creations` |
| Project-creation SQL success / failed | `taskmining.project_creation_sql_success` / `_sql_failed` |
| Project-creation custom success / failed | `taskmining.project_creation_custom_success` / `_custom_failed` |

- **Project-creation failure rate** = `failed / (success + failed)` across SQL + custom.
- **Daily creation trend** = `taskmining.project.creations` timeseries, `rollup(sum, 86400)`.

> Note: headline parquet/uploader totals come from the **metrics** (server-side, authoritative).
> Per-team parquet/screenshot are **log-derived** activity indicators and will not reconcile
> exactly to the headline metric — label them as client-log counts.

### Reference Datadog dashboards (link out; do not scrape)
- Task Mining Client — `cww-saa-yar`
- Task Mining Clients and Version — `ezd-bqm-5ce`
- Task Mining Clients by Version — `e2y-g4j-j8h`
- Task Mining Client Stats — `vu2-bra-ary`
- Task Mining Project Creation — `srx-dq5-khx`
- Task Mining Image Uploader — `c6s-mkh-nfk`

---

## 6. Customer segmentation

Classify each `@teamDomain` into one of three segments (heuristic, best-effort):

- **Internal** — generic/internal tenants and demo/training/test artifacts. Signals:
  exact names like `prod`, `production`, `productive`, `sandbox`, `task-mining`,
  `download`, `workday`; names containing `demo`, `training`, `test`, `enablement`,
  `celonis`, `apollo`, `launchpad`, color-word random slugs (e.g. `frosty-olive-antlion`),
  and random-hash slugs with a trailing date (e.g. `kpdgk5yo-2025-12-12`).
- **Sandbox / POV** — names containing `sandbox`, `-sb`, `pov`, `poc`, `partner-sandbox`, `trial`.
- **Customer** — everything else (real tenant slugs).

Segmentation drives: filter chips in the team table, the "active customers" count
(Customer + Sandbox/POV, excluding Internal), and error totals scoped to customer teams.

---

## 7. Data model (TypeScript)

```ts
// src/data/adoption.ts (generated snapshot)
export interface SummaryMetrics {
  activeClients: number; activeTeams: number; suspendedClients: number;
  captureStarts: number; parquetUploadsSuccess: number; projectCreations: number;
  projectCreationFailurePct: number; sqlSuccessJobs: number; sqlSuccessTeams: number;
  quickstartJobs: number; quickstartTeams: number; metadataRequests: number;
  configRequests: number; sqlExecutions: number; uploaderSuccess: number;
}
export interface TrendPoint { day: number; count: number; }
export interface VersionPoint { version: string; clients: number; }
export interface WeekPoint { week: string; clients: number; }
export interface TeamRecord {
  team: string; clients: number; versions: number;
  parquet: number; image: number; errors: number;
}

// src/data/customers.ts (generated by scripts/build_customers.py)
export interface CustomerRecord {
  customer: string;        // logo name from the contract book
  contractValue: number;   // current ACV (USD); 0 = none on record
  activeClients: number;   // Datadog active clients (0 if unmatched)
  endDate: string | null;  // ISO date of latest active subscription
  active: boolean;         // has >= 1 active subscription (end >= today)
  matchedTeams: string[];  // Datadog @teamDomain(s) joined for adoption
}
```

### Derived helpers (`src/lib/adoption.ts`)
- `segmentOf(team): Segment`, `displayName(team): string`, `enrich(records): EnrichedTeam[]`
  (adds `segment`, `uploads = parquet + image`).
- Formatters: `formatNumber`, `formatCompact` (e.g. `9.07M`), `formatPct`.
- `SEGMENTS = ["Customer","Sandbox / POV","Internal"]`.

---

## 8. Contract aggregation + join (scripts/build_customers.py)

Per logo (customer), considering only **active** subscriptions (`End Date >= today`):
- `contractValue` = sum over active subs of each sub's **max monthly ACV** across columns.
- `endDate` = max active `End Date` (fallback: latest end date overall if none active).
- `active` = has ≥ 1 active subscription.
- `activeClients` = sum of Datadog clients for the mapped `@teamDomain`(s).

Join: maintain an explicit `logo_to_teams` map (logo name → list of team domains), because
contract logo names (e.g. "Allstate Insurance Company") differ from Datadog slugs
(`allstate`). Examples: `refinitiv`→Refinitiv/LSEG, `dbank`+`dbank-psb`→Deutsche Bank,
`schlumberger`+`schlumberger-qa`→SLB, `majid-ai-futtaim`→Majid Al Futtaim. Unmatched
customers get `activeClients = 0`.

Output: write `src/data/customers.ts` as a typed array (JSON literal) + interface.

---

## 9. Views / UI

Single page (`src/app/page.tsx`), max width ~1100px, two logical sections.

### 9.1 Header
Title + period badge + period range + source line ("Datadog — celonis.datadoghq.com").

### 9.2 Adoption (Datadog)
- **Summary strip** (two rows of 4 `Stat` cards): Active clients, Active teams,
  Project creations, Creation failure rate (warning tone), Capture sessions,
  Parquet uploads, SQL jobs OK (success tone), Uploader successes (compact).
- **Charts** (2-up):
  - `CreationTrend` — SVG vertical bar chart, daily project creations.
  - `VersionChart` — SVG horizontal bars, distinct clients per recorder version.
- **Customer drill-down table** (`CustomerTable`, client component):
  - Columns: Customer (displayName + raw domain), Segment badge, Clients, Versions,
    Uploads, Errors.
  - Search box; segment filter chips (All / Customer / Sandbox·POV / Internal) with counts;
    sortable columns; click row to expand a detail panel (share of clients, versions,
    parquet, screenshots, errors).
  - Footer: "showing N of M teams · clients in view / total".

### 9.3 Customers — contract value & adoption
- **Stat strip**: Total contract value (compact USD), Customers (active/expired),
  Active + adopting (success), Live ACV no usage (warning — churn-risk dollars).
- **Contracts table** (`CustomerContracts`, client component):
  - Columns: **Customer name**, **Contract value** (USD, "—" if 0),
    **Active clients** (Datadog), **Contract ends** (date; highlight if ≤ 90 days).
  - Row badges: `Expired` (no active sub) or `No usage` (active contract, 0 clients).
  - Search; filter chips All / Active / Expired; sortable; footer totals for the view.

### 9.4 Footer
Data-provenance notes: Datadog snapshot + best-effort segmentation + ~30-day log retention;
contract values from the Excel (latest populated month) name-matched to Datadog domains.

### UI primitives (`src/components/ui/`)
- `Card` / `CardHeader` / `CardContent`, `Badge` (tones: neutral/accent/success/warning/danger),
  `Stat` (label, value, hint, tone). Colors via CSS variables in `globals.css`
  (light + dark via `prefers-color-scheme`).

---

## 10. Outputs / exports

- **Excel export** (`scripts/export_xlsx.py`): reads `src/data/customers.ts`, writes a
  minimal valid `.xlsx` (stdlib `zipfile` + XML; styled header, currency + date number
  formats, autofilter). Sheet "Customer Adoption" columns:
  `Customer name | Info about usage (Yes/No) | # active clients | Contract value | End of contract`.
- **Slack monthly/bi-weekly report** (text template):
  ```
  :bar_chart: Task Mining Adoption — <PERIOD>
  • Active clients: <n>
  • Active customers: <n> (incl. sandbox envs; excludes internal/testing)
  • Errors (customer teams): <n>
  • Data uploaded: <parquet> Parquet files (+<screenshots> screenshots) · <uploader> uploader events
  Top 10 customers by active clients
   1. <team> — <clients> ...
  ```
  Include a Datadog reference link. Errors counted for **customer teams only**.

---

## 11. Refresh workflow

1. Query Datadog (MCP) for the window → update `src/data/adoption.ts`
   (`PERIOD`, `PERIOD_RANGE`, `summary`, `creationTrend`, `versionMix`,
   `weeklyActiveClients`, `teams`).
2. `python3 scripts/build_customers.py "<path>/Customers Task mining.xlsx" > src/data/customers.ts`
3. (optional) `python3 scripts/export_xlsx.py "exports/Task Mining - Customer Adoption.xlsx"`
4. `npm run build` → static site in `out/`.
5. Serve: `python3 -m http.server 4321 --directory out`.

Reading the source Excel for inspection: `scripts/read_xlsx.py <file>` (stdlib parser that
dumps each sheet as TSV — handles sharedStrings + inline strings).

---

## 12. File structure

```
src/
  app/        layout.tsx, page.tsx, globals.css   (theme via CSS vars, system fonts)
  components/ creation-trend.tsx, version-chart.tsx, customer-table.tsx,
              customer-contracts.tsx, ui/{card,badge,stat}.tsx
  data/       adoption.ts (Datadog snapshot), customers.ts (generated join)
  lib/        adoption.ts (segmentation + formatters), cn.ts
scripts/      read_xlsx.py, build_customers.py, export_xlsx.py
specs/        adoption-dashboard-spec.md
next.config.ts (output: "export", images.unoptimized)
```

---

## 13. Acceptance criteria

- `npm run build` succeeds with **no network**, produces a static `out/` that renders fully
  when served by a plain static file server.
- All numbers come from typed data files; no runtime fetches; no secrets in client bundle.
- Team table: search, segment filter, sort, and row expand all work client-side.
- Contracts table: search, Active/Expired filter, sort work; `No usage` / `Expired` badges
  correct; footer totals reflect the filtered view.
- "Active customers" excludes Internal; "Errors (customer teams)" excludes Internal teams.
- Excel export opens in Excel/Numbers with correct currency + date formatting and an autofilter.
- Every file ≤ 300 lines.

---

## 14. Open items / future

- Refresh of `summary` fields that still need confirmed Datadog queries:
  `captureStarts`, `sqlSuccessJobs/Teams`, `quickstartJobs/Teams`, `metadataRequests`,
  `configRequests`, `sqlExecutions` (derive from `taskmining.*` metrics / API-usage logs).
- Per-customer Datadog deep-links (logs explorer filtered by `@teamDomain`) on each row.
- Automate the refresh as a scheduled job that regenerates data files + posts the Slack report.
- Improve logo↔teamDomain matching (some high-ACV customers show 0 usage due to name gaps).
```
