"use client";

import { useMemo, useState } from "react";
import type { VersionPoint } from "@/data/adoption";
import type { TeamVersions } from "@/data/versions";
import { displayName, segmentOf } from "@/lib/adoption";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const ALL = "__all__";

export function VersionByCustomer({
  totals,
  byTeam,
  period,
  selectedVersion = null,
  onSelectVersion,
}: {
  totals: VersionPoint[];
  byTeam: TeamVersions[];
  period: string;
  selectedVersion?: string | null;
  onSelectVersion?: (version: string | null) => void;
}) {
  const [selected, setSelected] = useState<string>(ALL);

  const options = useMemo(
    () => [...byTeam].sort((a, b) => b.clients - a.clients),
    [byTeam],
  );

  const current = useMemo(
    () => byTeam.find((t) => t.team === selected) ?? null,
    [byTeam, selected],
  );

  const data = current ? current.versions : totals;
  const totalClients = current
    ? current.clients
    : totals.reduce((s, v) => s + v.clients, 0);
  const rows = data.slice(0, 8);
  const max = Math.max(...rows.map((d) => d.clients), 1);

  // Customers (team domains) running the selected version, with their client
  // count on that version — the direct "which customers" drill-down.
  const versionCustomers = useMemo(() => {
    if (!selectedVersion) return [];
    return byTeam
      .map((t) => {
        const v = t.versions.find((x) => x.version === selectedVersion);
        return v ? { team: t.team, clients: v.clients } : null;
      })
      .filter((x): x is { team: string; clients: number } => x !== null)
      .sort((a, b) => b.clients - a.clients);
  }, [byTeam, selectedVersion]);

  return (
    <Card>
      <CardHeader
        title="Recorder version adoption"
        subtitle={`distinct clients per version · ${period}`}
        action={
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-8 max-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs outline-none focus:border-[var(--accent)]"
          >
            <option value={ALL}>All customers</option>
            {options.map((t) => (
              <option key={t.team} value={t.team}>
                {displayName(t.team)} ({t.clients})
              </option>
            ))}
          </select>
        }
      />
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl font-semibold tabular-nums">{totalClients}</span>
          <span className="text-xs text-[var(--muted)]">
            clients{current ? "" : " across all customers"}
          </span>
          {current ? <Badge tone="neutral">{segmentOf(current.team)}</Badge> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((d) => {
            const isSelected = selectedVersion === d.version;
            const clickable = Boolean(onSelectVersion);
            return (
              <button
                key={d.version}
                type="button"
                disabled={!clickable}
                onClick={() => onSelectVersion?.(isSelected ? null : d.version)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-1.5 py-1 text-left transition-colors",
                  clickable && "cursor-pointer hover:bg-[var(--surface-2)]",
                  isSelected && "bg-[var(--accent-soft)]",
                )}
              >
                <span
                  className={cn(
                    "w-24 shrink-0 font-mono text-xs",
                    isSelected ? "text-[var(--accent)]" : "text-[var(--muted)]",
                  )}
                >
                  {d.version}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(d.clients / max) * 100}%`,
                      background: isSelected ? "var(--accent)" : "var(--accent)",
                      opacity: selectedVersion && !isSelected ? 0.4 : 1,
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[var(--foreground)]">
                  {d.clients}
                </span>
              </button>
            );
          })}
          <p className="mt-1 text-xs text-[var(--muted)]">
            {onSelectVersion
              ? "Click a version to see which customers run it (also filters the table above)."
              : current
                ? `${displayName(current.team)} · ${current.versions.length} version${current.versions.length === 1 ? "" : "s"} in use (top 8 shown)`
                : "Top 8 versions across all customers"}
          </p>
        </div>

        {selectedVersion ? (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--foreground)]">
                Customers on{" "}
                <span className="font-mono text-[var(--accent)]">{selectedVersion}</span>
                <span className="ml-1 font-normal text-[var(--muted)]">
                  ({versionCustomers.length})
                </span>
              </span>
              <button
                type="button"
                onClick={() => onSelectVersion?.(null)}
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Clear ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {versionCustomers.map((c) => (
                <span
                  key={c.team}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs"
                >
                  <span className="font-medium text-[var(--foreground)]">
                    {displayName(c.team)}
                  </span>
                  <span className="tabular-nums text-[var(--muted)]">{c.clients}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
