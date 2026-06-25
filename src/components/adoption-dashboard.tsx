"use client";

import { useMemo, useState } from "react";
import type { WeekPoint } from "@/data/adoption";
import type { EnrichedTeam } from "@/lib/adoption";
import type { GrowthCustomer } from "@/lib/growth";
import type { CustomerFilter, CustomerSortKey, SortDir } from "@/lib/customers";
import { customerKpis, filterCounts, filterSortCustomers } from "@/lib/customers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CustomerKpis } from "@/components/customer-kpis";
import { CustomerOverview } from "@/components/customer-overview";
import { TopCustomersChart } from "@/components/top-customers-chart";
import { WeeklyClientsChart } from "@/components/weekly-clients-chart";
import { VersionByCustomer } from "@/components/version-by-customer";
import { VERSION_PERIOD, versionTotals, versionsByTeam } from "@/data/versions";

export function AdoptionDashboard({
  customers,
  teams,
  weeklyActiveClients,
}: {
  customers: GrowthCustomer[];
  teams: EnrichedTeam[];
  weeklyActiveClients: WeekPoint[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("All");
  const [sortKey, setSortKey] = useState<CustomerSortKey>("activeClients");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [versionFilter, setVersionFilter] = useState<string | null>(null);

  const teamClients = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of teams) map[t.team] = t.clients;
    return map;
  }, [teams]);

  // Map every recorder version to the set of team domains running it, so a
  // version click can filter the customer table by matched team.
  const versionTeams = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const t of versionsByTeam) {
      for (const v of t.versions) {
        (map[v.version] ??= new Set()).add(t.team);
      }
    }
    return map;
  }, []);

  const rows = useMemo(() => {
    const base = filterSortCustomers(customers, { query, filter, sortKey, sortDir });
    if (!versionFilter) return base;
    const vt = versionTeams[versionFilter] ?? new Set<string>();
    return base.filter((c) => c.matchedTeams.some((t) => vt.has(t)));
  }, [customers, query, filter, sortKey, sortDir, versionFilter, versionTeams]);
  const kpis = useMemo(() => customerKpis(rows), [rows]);
  const counts = useMemo(() => filterCounts(customers), [customers]);

  // KPI cards double as filter toggles; clicking the active one clears it.
  const toggle = (f: CustomerFilter) => setFilter((cur) => (cur === f ? "All" : f));

  function toggleSort(key: CustomerSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "customer" || key === "endDate" ? "asc" : "desc");
    }
  }

  return (
    <>
      <CustomerKpis kpis={kpis} filter={filter} onToggle={toggle} />

      {versionFilter ? (
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-sm">
          <span className="text-[var(--foreground)]">
            Showing customers running recorder{" "}
            <span className="font-mono font-semibold text-[var(--accent)]">
              {versionFilter}
            </span>{" "}
            · <span className="font-semibold tabular-nums">{rows.length}</span>{" "}
            {rows.length === 1 ? "customer" : "customers"}
          </span>
          <button
            type="button"
            onClick={() => setVersionFilter(null)}
            className="ml-auto rounded-md px-2 py-0.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--surface)]"
          >
            Clear version filter ✕
          </button>
        </div>
      ) : null}

      <section className="mt-6">
        <CustomerOverview
          rows={rows}
          totalCustomers={customers.length}
          counts={counts}
          teamClients={teamClients}
          query={query}
          onQuery={setQuery}
          filter={filter}
          onFilter={setFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Top active customers"
            subtitle="active Task Mining clients · current view"
          />
          <CardContent>
            <TopCustomersChart customers={rows.filter((r) => !r.prospect)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Task Mining clients"
            subtitle="distinct active clients per week"
          />
          <CardContent>
            <WeeklyClientsChart data={weeklyActiveClients} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-3">
        <VersionByCustomer
          totals={versionTotals}
          byTeam={versionsByTeam}
          period={VERSION_PERIOD}
          selectedVersion={versionFilter}
          onSelectVersion={setVersionFilter}
        />
      </section>
    </>
  );
}
