import type { CustomerRecord } from "@/data/customers";
import type {
  CustomerFilter,
  CustomerKpis,
  CustomerSortKey,
  SortDir,
} from "@/lib/customers";
import { CUSTOMER_FILTERS } from "@/lib/customers";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function fmtMoney(n: number): string {
  return n > 0 ? currency.format(n) : "—";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TODAY = new Date("2026-06-04T00:00:00");
const DAY = 1000 * 60 * 60 * 24;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.round((new Date(iso + "T00:00:00").getTime() - TODAY.getTime()) / DAY);
}

export function CustomerOverview({
  rows,
  totalCustomers,
  kpis,
  counts,
  query,
  onQuery,
  filter,
  onFilter,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: CustomerRecord[];
  totalCustomers: number;
  kpis: CustomerKpis;
  counts: Record<CustomerFilter, number>;
  query: string;
  onQuery: (s: string) => void;
  filter: CustomerFilter;
  onFilter: (f: CustomerFilter) => void;
  sortKey: CustomerSortKey;
  sortDir: SortDir;
  onSort: (k: CustomerSortKey) => void;
}) {
  // A KPI card toggles its matching filter; clicking the active one clears it.
  const toggle = (f: CustomerFilter) => onFilter(filter === f ? "All" : f);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold tracking-tight">
          Customers — contract value &amp; adoption
        </h2>
        <Badge tone="neutral">contract book</Badge>
        <span className="text-xs text-[var(--muted)]">
          KPIs reflect the {kpis.customersInView} customers in view — click a card
          or filter below
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat
          label="Active contracts"
          value={kpis.activeContracts.toLocaleString("en-US")}
          onClick={() => toggle("Active")}
          active={filter === "Active"}
          hint="customers with a live Task Mining contract"
        />
        <Stat
          label="Active, no clients"
          value={kpis.noUsage.toLocaleString("en-US")}
          tone="warning"
          onClick={() => toggle("No usage")}
          active={filter === "No usage"}
          hint="active contract · 0 active clients"
        />
        <Stat
          label="Active + adopting"
          value={kpis.adopting.toLocaleString("en-US")}
          tone="success"
          onClick={() => toggle("Adopting")}
          active={filter === "Adopting"}
          hint="active contract with ≥1 client"
        />
        <Stat
          label="Contract value (ACV)"
          value={currency.format(kpis.totalAcv)}
          hint={`${kpis.activeContracts} active contracts in view`}
        />
        <Stat
          label="ACV at risk"
          value={currency.format(kpis.noUsageAcv)}
          tone="warning"
          hint="live contracts with no usage"
        />
        <Stat
          label="Customers in view"
          value={kpis.customersInView.toLocaleString("en-US")}
          hint={`${kpis.activeContracts} active · ${kpis.expired} expired`}
        />
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">
              Customers — contract value vs. adoption
            </h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              All {totalCustomers} customers from the contract book · ACV joined with
              active clients (Datadog, May 2026)
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search customer…"
            aria-label="Search customers"
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none focus:border-[var(--accent)] sm:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
          {CUSTOMER_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {f} <span className="opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[var(--border)] text-xs text-[var(--muted)]">
                <Th onClick={() => onSort("customer")} active={sortKey === "customer"} dir={sortDir} align="left">
                  Customer
                </Th>
                <Th onClick={() => onSort("contractValue")} active={sortKey === "contractValue"} dir={sortDir}>
                  Contract value
                </Th>
                <Th onClick={() => onSort("activeClients")} active={sortKey === "activeClients"} dir={sortDir}>
                  Active clients
                </Th>
                <Th onClick={() => onSort("endDate")} active={sortKey === "endDate"} dir={sortDir}>
                  Contract ends
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const d = daysUntil(c.endDate);
                const expiringSoon = c.active && d !== null && d <= 90;
                return (
                  <tr
                    key={c.customer}
                    className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{c.customer}</span>
                        {!c.active ? (
                          <Badge tone="neutral">Expired</Badge>
                        ) : c.activeClients === 0 ? (
                          <Badge tone="warning">No usage</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {fmtMoney(c.contractValue)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        c.activeClients > 0 ? "font-medium" : "text-[var(--muted)]",
                      )}
                    >
                      {c.activeClients > 0 ? c.activeClients.toLocaleString("en-US") : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        expiringSoon ? "font-medium text-[var(--warning)]" : "text-[var(--muted)]",
                      )}
                    >
                      {fmtDate(c.endDate)}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                    No customers match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-1 border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {rows.length} of {totalCustomers} customers
          </span>
          <span>
            {currency.format(kpis.totalAcv)} ACV ·{" "}
            {kpis.totalActiveClients.toLocaleString("en-US")} active clients in view
          </span>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  align = "right",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  align?: "left" | "right";
}) {
  return (
    <th className={cn("px-4 py-2 font-medium", align === "right" ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
          active && "text-[var(--foreground)]",
        )}
      >
        {children}
        <span className="text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}
