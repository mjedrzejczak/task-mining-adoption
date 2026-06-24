import {
  PERIOD,
  PERIOD_RANGE,
  SOURCE,
  summary,
  teams,
  weeklyActiveClients,
} from "@/data/adoption";
import { enrich } from "@/lib/adoption";
import { buildGrowthCustomers } from "@/lib/growth";
import { Badge } from "@/components/ui/badge";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { customers as contracts } from "@/data/customers";

export default function Home() {
  const enriched = enrich(teams);
  const customerCount = enriched.filter((t) => t.segment === "Customer").length;

  // Contracts are static; active clients are re-derived from the latest weekly
  // Datadog refresh by re-joining each customer's matched teams.
  const teamClients: Record<string, number> = {};
  for (const t of teams) teamClients[t.team] = t.clients;
  const joined = contracts.map((c) => ({
    ...c,
    activeClients: c.matchedTeams.reduce(
      (sum, team) => sum + (teamClients[team] ?? 0),
      0,
    ),
  }));
  // Enrich contracts with growth cohorts + synthetic prospect rows, so the one
  // consolidated table covers contracts, adoption and the growth pipeline.
  const customers = buildGrowthCustomers(joined, teamClients);

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

      <DashboardTabs
        customers={customers}
        teams={enriched}
        weeklyActiveClients={weeklyActiveClients}
      />

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Snapshot generated from Datadog. Contract values are from “Customers Task
        mining.xlsx” (latest populated month, Mar 2026); active clients are
        name-matched to Datadog team domains, so unmatched customers may show 0
        and a customer can map to multiple teams. KPIs and the “Top active
        customers” chart reflect the customers currently in view; the weekly
        clients series is platform-wide and partial due to ~30-day log retention.
      </footer>
    </main>
  );
}
