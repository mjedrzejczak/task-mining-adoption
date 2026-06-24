"use client";

import { Fragment, useState } from "react";
import type { GrowthCustomer } from "@/lib/growth";
import type {
  CustomerFilter,
  CustomerSortKey,
  SortDir,
} from "@/lib/customers";
import { CUSTOMER_FILTERS } from "@/lib/customers";
import { Badge } from "@/components/ui/badge";
import { CcmBadge } from "@/components/ui/ccm-badge";
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
  counts,
  teamClients,
  query,
  onQuery,
  filter,
  onFilter,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: GrowthCustomer[];
  totalCustomers: number;
  counts: Record<CustomerFilter, number>;
  teamClients: Record<string, number>;
  query: string;
  onQuery: (s: string) => void;
  filter: CustomerFilter;
  onFilter: (f: CustomerFilter) => void;
  sortKey: CustomerSortKey;
  sortDir: SortDir;
  onSort: (k: CustomerSortKey) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const totalAcv = rows.reduce((s, c) => s + c.contractValue, 0);
  const totalClients = rows.reduce((s, c) => s + c.activeClients, 0);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Customers — contracts, adoption &amp; growth</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {totalCustomers} accounts · contracts + Datadog adoption with growth
            cohorts (lighthouse · PoV · underutilized) · filter or click a row
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
              <th className="px-4 py-2 text-left font-medium">Growth</th>
              <Th onClick={() => onSort("activeClients")} active={sortKey === "activeClients"} dir={sortDir}>
                Active clients
              </Th>
              <Th onClick={() => onSort("teams")} active={sortKey === "teams"} dir={sortDir}>
                Teams
              </Th>
              <Th onClick={() => onSort("contractValue")} active={sortKey === "contractValue"} dir={sortDir}>
                Contract value
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
              const teamCount = c.matchedTeams.length;
              const isOpen = expanded === c.customer;
              return (
                <Fragment key={c.customer}>
                  <tr
                    onClick={() => teamCount > 0 && setExpanded(isOpen ? null : c.customer)}
                    className={cn(
                      "border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]",
                      teamCount > 0 && "cursor-pointer",
                      isOpen && "bg-[var(--surface-2)]",
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {teamCount > 0 ? (
                          <span
                            className={cn(
                              "inline-block text-[var(--muted)] transition-transform",
                              isOpen && "rotate-90",
                            )}
                            aria-hidden
                          >
                            ›
                          </span>
                        ) : (
                          <span className="inline-block w-[1ch]" aria-hidden />
                        )}
                        <span className="truncate font-medium">{c.customer}</span>
                        <StatusBadge c={c} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <GrowthCell c={c} />
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        c.activeClients > 0 ? "font-medium" : "text-[var(--muted)]",
                      )}
                    >
                      {c.activeClients > 0 ? c.activeClients.toLocaleString("en-US") : "—"}
                      {c.prospect && c.activeClients > 0 ? (
                        <span className="ml-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          trial
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">
                      {teamCount > 0 ? teamCount : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {fmtMoney(c.contractValue)}
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
                  {isOpen && teamCount > 0 ? (
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                      <td colSpan={6} className="px-4 py-3">
                        <TeamBreakdown teams={c.matchedTeams} teamClients={teamClients} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
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
          {currency.format(totalAcv)} ACV · {totalClients.toLocaleString("en-US")} active clients
          in view
        </span>
      </div>
    </div>
  );
}

// Contract / adoption status chip shown next to the customer name.
function StatusBadge({ c }: { c: GrowthCustomer }) {
  const status = c.prospect
    ? { tone: "neutral" as const, label: "Prospect" }
    : !c.active
      ? { tone: "neutral" as const, label: "Expired" }
      : c.activeClients === 0
        ? { tone: "warning" as const, label: "No usage" }
        : null;
  return status ? <Badge tone={status.tone}>{status.label}</Badge> : null;
}

// Growth cohort labels, shown in the dedicated "Growth" column.
function GrowthCell({ c }: { c: GrowthCustomer }) {
  const none = !c.ccm && !c.lighthouse && !c.pov && !c.underutilized;
  if (none) return <span className="text-xs text-[var(--muted)]">—</span>;
  return (
    <>
      {c.ccm ? <CcmBadge /> : null}
      {c.lighthouse ? <Badge tone="accent">Lighthouse</Badge> : null}
      {c.pov ? <Badge tone="warning">PoV</Badge> : null}
      {c.underutilized ? <Badge tone="warning">Underutilized</Badge> : null}
    </>
  );
}

// Per-customer Datadog team breakdown — shown when a customer maps to one or
// more @teamDomain values (e.g. Deutsche Bank → dbank + dbank-psb).
function TeamBreakdown({
  teams,
  teamClients,
}: {
  teams: string[];
  teamClients: Record<string, number>;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-[var(--muted)]">
        {teams.length} Datadog {teams.length === 1 ? "team" : "teams"} mapped to this customer
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t) => (
          <div
            key={t}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          >
            <span className="truncate font-mono text-xs">{t}</span>
            <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
              {(teamClients[t] ?? 0).toLocaleString("en-US")} clients
            </span>
          </div>
        ))}
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
