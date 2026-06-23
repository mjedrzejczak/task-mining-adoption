"use client";

import { Fragment, useMemo, useState } from "react";
import type { EnrichedTeam, Segment } from "@/lib/adoption";
import { displayName, formatNumber, SEGMENTS } from "@/lib/adoption";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type SortKey = "team" | "clients" | "versions" | "uploads" | "errors";
type SortDir = "asc" | "desc";
type Filter = Segment | "All";

const segmentTone: Record<Segment, "accent" | "warning" | "neutral"> = {
  Customer: "accent",
  "Sandbox / POV": "warning",
  Internal: "neutral",
};

export function CustomerTable({
  teams,
  totalClients,
}: {
  teams: EnrichedTeam[];
  totalClients: number;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("clients");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      All: teams.length,
      Customer: 0,
      "Sandbox / POV": 0,
      Internal: 0,
    };
    for (const t of teams) map[t.segment]++;
    return map;
  }, [teams]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = teams.filter((t) => {
      if (filter !== "All" && t.segment !== filter) return false;
      if (q && !t.team.toLowerCase().includes(q) && !displayName(t.team).toLowerCase().includes(q))
        return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "team") return a.team.localeCompare(b.team) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [teams, query, filter, sortKey, sortDir]);

  const shownClients = rows.reduce((s, t) => s + t.clients, 0);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "team" ? "asc" : "desc");
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Customer drill-down</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            All {teams.length} teams active on the Task Mining client · click a row for detail
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
        {(["All", ...SEGMENTS] as Filter[]).map((f) => (
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
              <Th onClick={() => toggleSort("team")} active={sortKey === "team"} dir={sortDir} align="left">
                Customer
              </Th>
              <th className="px-4 py-2 text-left font-medium">Segment</th>
              <Th onClick={() => toggleSort("clients")} active={sortKey === "clients"} dir={sortDir}>
                Clients
              </Th>
              <Th onClick={() => toggleSort("versions")} active={sortKey === "versions"} dir={sortDir}>
                Versions
              </Th>
              <Th onClick={() => toggleSort("uploads")} active={sortKey === "uploads"} dir={sortDir}>
                Uploads
              </Th>
              <Th onClick={() => toggleSort("errors")} active={sortKey === "errors"} dir={sortDir}>
                Errors
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const isOpen = expanded === t.team;
              return (
                <Fragment key={t.team}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : t.team)}
                    className={cn(
                      "cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]",
                      isOpen && "bg-[var(--surface-2)]",
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-block text-[var(--muted)] transition-transform",
                            isOpen && "rotate-90",
                          )}
                        >
                          ›
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{displayName(t.team)}</div>
                          <div className="truncate font-mono text-xs text-[var(--muted)]">
                            {t.team}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={segmentTone[t.segment]}>{t.segment}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {formatNumber(t.clients)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">
                      {t.versions}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">
                      {formatNumber(t.uploads)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">
                      {formatNumber(t.errors)}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                      <td colSpan={6} className="px-4 py-4">
                        <DetailPanel team={t} totalClients={totalClients} />
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

      <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
        <span>
          Showing {rows.length} of {teams.length} teams
        </span>
        <span>
          {formatNumber(shownClients)} clients in view · {formatNumber(totalClients)} total
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

function DetailPanel({
  team,
  totalClients,
}: {
  team: EnrichedTeam;
  totalClients: number;
}) {
  const share = ((team.clients / totalClients) * 100).toFixed(2);
  const items: { label: string; value: string }[] = [
    { label: "Team domain", value: team.team },
    { label: "Segment", value: team.segment },
    { label: "Active clients", value: formatNumber(team.clients) },
    { label: "Share of all clients", value: `${share}%` },
    { label: "Recorder versions in use", value: String(team.versions) },
    { label: "Parquet uploads (success)", value: formatNumber(team.parquet) },
    { label: "Screenshot uploads (success)", value: formatNumber(team.image) },
    { label: "Error logs", value: formatNumber(team.errors) },
  ];
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-xs text-[var(--muted)]">{it.label}</dt>
          <dd className="mt-0.5 truncate font-mono text-sm font-medium">{it.value}</dd>
        </div>
      ))}
    </div>
  );
}
