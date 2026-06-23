import {
  PERIOD,
  PERIOD_RANGE,
  SOURCE,
  creationTrend,
  summary,
  teams,
  versionMix,
} from "@/data/adoption";
import { enrich, formatCompact, formatNumber, formatPct } from "@/lib/adoption";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { CreationTrend } from "@/components/creation-trend";
import { VersionChart } from "@/components/version-chart";
import { CustomerTable } from "@/components/customer-table";
import { CustomerContracts } from "@/components/customer-contracts";
import { customers } from "@/data/customers";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function Home() {
  const enriched = enrich(teams);
  const customerCount = enriched.filter((t) => t.segment === "Customer").length;

  const activeCustomers = customers.filter((c) => c.active);
  const totalAcv = customers.reduce((s, c) => s + c.contractValue, 0);
  const withUsage = activeCustomers.filter((c) => c.activeClients > 0).length;
  const noUsageAcv = activeCustomers
    .filter((c) => c.activeClients === 0)
    .reduce((s, c) => s + c.contractValue, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Task Mining Adoption
            </h1>
            <Badge tone="accent">{PERIOD}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {PERIOD_RANGE} · {SOURCE}
          </p>
        </div>
        <p className="text-xs text-[var(--muted)]">
          {customerCount} customers · {summary.activeTeams} teams · snapshot
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Active clients"
          value={formatNumber(summary.activeClients)}
          hint="distinct recorders, prod"
        />
        <Stat
          label="Active teams"
          value={formatNumber(summary.activeTeams)}
          hint="distinct team domains"
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

      <section className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Project creations per day"
            subtitle="taskmining.project.creations · daily"
          />
          <CardContent>
            <CreationTrend data={creationTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Recorder version adoption"
            subtitle="distinct clients per version"
          />
          <CardContent>
            <VersionChart data={versionMix} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <CustomerTable teams={enriched} totalClients={summary.activeClients} />
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            Customers — contract value &amp; adoption
          </h2>
          <Badge tone="neutral">contract book</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Total contract value"
            value={usd.format(totalAcv)}
            hint={`${activeCustomers.length} active contracts`}
          />
          <Stat
            label="Customers"
            value={formatNumber(customers.length)}
            hint={`${activeCustomers.length} active · ${customers.length - activeCustomers.length} expired`}
          />
          <Stat
            label="Active + adopting"
            value={formatNumber(withUsage)}
            tone="success"
            hint="active contract with clients"
          />
          <Stat
            label="Live ACV, no usage"
            value={usd.format(noUsageAcv)}
            tone="warning"
            hint="active contract, 0 clients"
          />
        </div>
        <div className="mt-3">
          <CustomerContracts customers={customers} />
        </div>
      </section>

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Snapshot generated from Datadog. Segmentation of team domains is
        best-effort. Weekly trends are partial due to ~30-day log retention.
        Contract values are from “Customers Task mining.xlsx” (latest populated
        month, Mar 2026); active clients are name-matched to Datadog team
        domains, so unmatched customers may show 0.
      </footer>
    </main>
  );
}
