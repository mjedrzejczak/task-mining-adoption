"use client";

import { useMemo, useState } from "react";
import type { CustomerRecord } from "@/data/customers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type SortKey = "customer" | "contractValue" | "activeClients" | "endDate";
type SortDir = "asc" | "desc";
type Filter = "All" | "Active" | "Expired";

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
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
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

export function CustomerContracts({ customers }: { customers: CustomerRecord[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("contractValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const counts = useMemo(() => {
    const active = customers.filter((c) => c.active).length;
    return { All: customers.length, Active: active, Expired: customers.length - active };
  }, [customers]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = customers.filter((c) => {
      if (filter === "Active" && !c.active) return false;
      if (filter === "Expired" && c.active) return false;
      if (q && !c.customer.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "customer") return a.customer.localeCompare(b.customer) * dir;
      if (sortKey === "endDate") {
        const av = a.endDate ?? "";
        const bv = b.endDate ?? "";
        return av.localeCompare(bv) * dir;
      }
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [customers, query, filter, sortKey, sortDir]);

  const totalACV = rows.reduce((s, c) => s + c.contractValue, 0);
  const totalClients = rows.reduce((s, c) => s + c.activeClients, 0);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "customer" || key === "endDate" ? "asc" : "desc");
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Customers — contract value vs. adoption</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            All {customers.length} customers from the contract book · ACV joined with active
            clients (Datadog, May 2026)
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer…"
          className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none focus:border-[var(--accent)] sm:w-64"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
        {(["All", "Active", "Expired"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
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
              <Th onClick={() => toggleSort("customer")} active={sortKey === "customer"} dir={sortDir} align="left">
                Customer
              </Th>
              <Th onClick={() => toggleSort("contractValue")} active={sortKey === "contractValue"} dir={sortDir}>
                Contract value
              </Th>
              <Th onClick={() => toggleSort("activeClients")} active={sortKey === "activeClients"} dir={sortDir}>
                Active clients
              </Th>
              <Th onClick={() => toggleSort("endDate")} active={sortKey === "endDate"} dir={sortDir}>
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
          Showing {rows.length} of {customers.length} customers
        </span>
        <span>
          {currency.format(totalACV)} ACV · {totalClients.toLocaleString("en-US")} active clients in
          view
        </span>
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
