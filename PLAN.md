# Task Mining Adoption Dashboard — PLAN

## Goal
A standalone web app to observe Task Mining adoption, with drill-down to the
complete customer (team) list.

## Decisions (confirmed with user)
- Stack: React 19 + Next.js (App Router) + Tailwind CSS, shadcn-style components.
- Data: **snapshot** baked in (no backend). Source = Datadog (celonis.datadoghq.com),
  period May–Jun 2026 (2026-05-01 → 2026-06-23).
- Drill-down: complete list of all teams/customers with client counts, versions,
  and activity — sortable + searchable table.

## Data source mapping (Datadog)
- Active clients / teams: `service:task-mining @logType:Client purpose:prod -clientId:taskmining`,
  distinct `@clientId` / `@teamDomain`.
- Versions: distinct `@clientId` per `@recorderVersion`.
- Uploads: `@uploaded.parquet.success`, `@uploaded.image.success` (sum).
- Errors: `status:error` count per team.
- Project creations: metric `taskmining.project.creations.as_count()`.
- SQL processing: `@logType:SQLDataProcessing @task-mining.execution.status:SUCCESS`.

## Architecture
- `src/data/adoption.ts` — typed snapshot (summary, daily trend, version mix, all teams).
- `src/lib/` — formatting + team segmentation helpers + adoption derived selectors.
- `src/components/ui/` — Card, Stat, Badge, SegmentedControl, Sparkline primitives.
- `src/components/` — SummaryGrid, CreationTrend, VersionChart, CustomerTable.
- `src/app/page.tsx` — overview KPIs + charts, then customer drill-down table.

## Steps
1. [x] Confirm stack + data approach.
2. [x] Pull complete snapshot from Datadog.
3. [ ] Bake snapshot into typed module.
4. [ ] Build UI primitives.
5. [ ] Build charts (inline SVG, no extra deps).
6. [ ] Build searchable/sortable customer table with expandable drill-down rows.
7. [ ] Compose dashboard page + theme.
8. [ ] Build/lint check.

## Notes / caveats
- Weekly active-client breakdown is partial (log retention ~30d), only late-May weeks present.
- Some `@teamDomain` values are environment/internal labels (`prod`, `production`,
  `productive`, sandboxes, POVs, date-coded trials). The table tags a **segment**
  (Customer / Sandbox-POV / Internal) and lets the user filter.
- To refresh: re-run the Datadog queries for the new window and replace `src/data/adoption.ts`.
