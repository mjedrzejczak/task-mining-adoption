import type { SummaryMetrics } from "@/data/adoption";
import { Stat } from "@/components/ui/stat";
import { formatCompact, formatNumber, formatPct } from "@/lib/adoption";

// `inView` metrics are derived from the customers currently shown in the table
// below; the rest are platform-wide Datadog aggregates with no per-customer
// breakdown, so they stay constant regardless of the customer filter.
export function TopKpis({
  summary,
  inViewClients,
  inViewTeams,
  filtered,
}: {
  summary: SummaryMetrics;
  inViewClients: number;
  inViewTeams: number;
  filtered: boolean;
}) {
  const scopeHint = filtered ? "in current customer view" : "across all customers";

  return (
    <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Active clients"
          value={formatNumber(inViewClients)}
          tone={filtered ? "success" : "default"}
          hint={`${scopeHint} · ${formatNumber(summary.activeClients)} platform-wide`}
        />
        <Stat
          label="Active teams"
          value={formatNumber(inViewTeams)}
          tone={filtered ? "success" : "default"}
          hint={`${scopeHint} · ${formatNumber(summary.activeTeams)} platform-wide`}
        />
        <Stat
          label="Project creations"
          value={formatNumber(summary.projectCreations)}
          hint={`${summary.sqlSuccessTeams} teams ran SQL jobs`}
        />
        <Stat
          label="Creation failure rate"
          value={formatPct(summary.projectCreationFailurePct)}
          tone="warning"
          hint="of all project creations"
        />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Capture sessions"
          value={formatNumber(summary.captureStarts)}
          hint="recordings started"
        />
        <Stat
          label="Parquet uploads"
          value={formatNumber(summary.parquetUploadsSuccess)}
          hint="successful files"
        />
        <Stat
          label="SQL jobs OK"
          value={formatNumber(summary.sqlSuccessJobs)}
          tone="success"
          hint="data processing"
        />
        <Stat
          label="Uploader successes"
          value={formatCompact(summary.uploaderSuccess)}
          hint="service-side events"
        />
      </section>
    </>
  );
}
