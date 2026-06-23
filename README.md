# Task Mining Adoption

A standalone dashboard to observe Celonis **Task Mining** adoption, with
drill-down to the complete customer (team) list.

- **Stack:** React 19 · Next.js 16 (App Router) · Tailwind CSS v4 · TypeScript
- **Data:** static snapshot baked in from Datadog (`celonis.datadoghq.com`),
  period **May 2026**. No backend required.

## What it shows

- KPI strip: active clients, active teams, project creations + failure rate,
  capture sessions, uploads, SQL jobs, uploader successes.
- Charts: daily project-creation trend, recorder-version adoption.
- **Customer drill-down table** (all 75 active teams):
  - search by name, filter by segment (Customer / Sandbox-POV / Internal),
  - sort by clients, versions, uploads, errors,
  - click any row to expand full per-team detail (domain, share of clients,
    versions, parquet/screenshot uploads, error logs).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Static build (this app is a snapshot, so it exports to fully static HTML):

```bash
npm run build      # outputs ./out
npx serve out      # or any static server
```

## Refresh the data

Re-run the Datadog queries for the new window and replace
[`src/data/adoption.ts`](src/data/adoption.ts). Key sources:

- Clients/teams: `service:task-mining @logType:Client purpose:prod -clientId:taskmining`
- Versions: distinct `@clientId` per `@recorderVersion`
- Uploads: `@uploaded.parquet.success`, `@uploaded.image.success`
- Errors: `status:error` per team
- Project creations: metric `taskmining.project.creations.as_count()`

See [`PLAN.md`](PLAN.md) for the full mapping and architecture.

## Notes

- Team-domain segmentation is best-effort (`src/lib/adoption.ts`).
- Weekly trends are partial due to ~30-day Datadog log retention.
