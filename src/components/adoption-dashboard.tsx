"use client";

import { useMemo, useState } from "react";
import type {
  SummaryMetrics,
  TrendPoint,
  VersionPoint,
} from "@/data/adoption";
import type { CustomerRecord } from "@/data/customers";
import type { EnrichedTeam } from "@/lib/adoption";
import type { CustomerFilter, CustomerSortKey, SortDir } from "@/lib/customers";
import { customerKpis, filterCounts, filterSortCustomers } from "@/lib/customers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreationTrend } from "@/components/creation-trend";
import { VersionChart } from "@/components/version-chart";
import { CustomerTable } from "@/components/customer-table";
import { CustomerOverview } from "@/components/customer-overview";
import { TopKpis } from "@/components/top-kpis";

export function AdoptionDashboard({
  customers,
  teams,
  summary,
  creationTrend,
  versionMix,
}: {
  customers: CustomerRecord[];
  teams: EnrichedTeam[];
  summary: SummaryMetrics;
  creationTrend: TrendPoint[];
  versionMix: VersionPoint[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("All");
  const [sortKey, setSortKey] = useState<CustomerSortKey>("contractValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(
    () => filterSortCustomers(customers, { query, filter, sortKey, sortDir }),
    [customers, query, filter, sortKey, sortDir],
  );
  const kpis = useMemo(() => customerKpis(rows), [rows]);
  const counts = useMemo(() => filterCounts(customers), [customers]);
  const filtered = query.trim() !== "" || filter !== "All";

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
      <TopKpis
        summary={summary}
        inViewClients={kpis.totalActiveClients}
        inViewTeams={kpis.activeTeams}
        filtered={filtered}
      />

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
        <CustomerTable teams={teams} totalClients={summary.activeClients} />
      </section>

      <section className="mt-10">
        <CustomerOverview
          rows={rows}
          totalCustomers={customers.length}
          kpis={kpis}
          counts={counts}
          query={query}
          onQuery={setQuery}
          filter={filter}
          onFilter={setFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
        />
      </section>
    </>
  );
}
