"use client";

import { useMemo, useState } from "react";
import type { WeekPoint } from "@/data/adoption";
import type { EnrichedTeam } from "@/lib/adoption";
import type { GrowthCustomer } from "@/lib/growth";
import { growthCounts } from "@/lib/growth";
import { AdoptionDashboard } from "@/components/adoption-dashboard";
import { CustomerGrowth } from "@/components/customer-growth";
import { cn } from "@/lib/cn";

type Tab = "adoption" | "growth";

export function DashboardTabs({
  customers,
  teams,
  weeklyActiveClients,
}: {
  customers: GrowthCustomer[];
  teams: EnrichedTeam[];
  weeklyActiveClients: WeekPoint[];
}) {
  const [tab, setTab] = useState<Tab>("adoption");
  const attention = useMemo(() => growthCounts(customers).attention, [customers]);

  return (
    <>
      <div role="tablist" className="mb-6 flex items-center gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "adoption"}
          onClick={() => setTab("adoption")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            tab === "adoption"
              ? "bg-[var(--surface-2)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          Adoption
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "growth"}
          onClick={() => setTab("growth")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
            tab === "growth"
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--accent-soft)] text-[var(--accent)] hover:brightness-95",
          )}
        >
          Customer growth
          {attention > 0 ? (
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                tab === "growth"
                  ? "bg-white/25 text-white"
                  : "bg-[var(--accent)] text-white",
              )}
            >
              {attention}
            </span>
          ) : null}
        </button>
      </div>

      {tab === "adoption" ? (
        <AdoptionDashboard
          customers={customers}
          teams={teams}
          weeklyActiveClients={weeklyActiveClients}
        />
      ) : (
        <CustomerGrowth customers={customers} />
      )}
    </>
  );
}
