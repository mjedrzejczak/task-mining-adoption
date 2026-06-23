import {
  PERIOD,
  PERIOD_RANGE,
  SOURCE,
  creationTrend,
  summary,
  teams,
  versionMix,
} from "@/data/adoption";
import { enrich } from "@/lib/adoption";
import { Badge } from "@/components/ui/badge";
import { AdoptionDashboard } from "@/components/adoption-dashboard";
import { customers } from "@/data/customers";

export default function Home() {
  const enriched = enrich(teams);
  const customerCount = enriched.filter((t) => t.segment === "Customer").length;

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

      <AdoptionDashboard
        customers={customers}
        teams={enriched}
        summary={summary}
        creationTrend={creationTrend}
        versionMix={versionMix}
      />

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Snapshot generated from Datadog. Segmentation of team domains is
        best-effort. Weekly trends are partial due to ~30-day log retention.
        Contract values are from “Customers Task mining.xlsx” (latest populated
        month, Mar 2026); active clients are name-matched to Datadog team
        domains, so unmatched customers may show 0. The top “Active clients /
        teams” KPIs reflect the customers currently in view.
      </footer>
    </main>
  );
}
