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

  const teamClients = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of teams) map[t.team] = t.clients;
    return map;
  }, [teams]);

  const rows = useMemo(
    () => filterSortCustomers(customers, { query, filter, sortKey, sortDir }),
    [customers, query, filter, sortKey, sortDir],
  );
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
    </>
  );
}
