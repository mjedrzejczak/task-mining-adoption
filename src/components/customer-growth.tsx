"use client";

import { useState } from "react";
import type { GrowthCustomer } from "@/lib/growth";
import {
  buildCcmList,
  buildLighthouseList,
  buildPovList,
  buildReviewGroups,
  buildUnderutilizedList,
  growthCounts,
  POV_WON_LIST,
  type LighthouseStatus,
  type PovRow,
} from "@/lib/growth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CcmBadge } from "@/components/ui/ccm-badge";
import { Stat } from "@/components/ui/stat";
import { cn } from "@/lib/cn";

const acvFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const num = (n: number) => n.toLocaleString("en-US");

function CcmTag() {
  return <CcmBadge />;
}

// A single account line: name + badges on the left, a metric on the right.
function Row({
  name,
  badges,
  metric,
  metricLabel,
}: {
  name: React.ReactNode;
  badges?: React.ReactNode;
  metric: string;
  metricLabel: string;
}) {
  return (
    <li className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="truncate text-sm font-medium">{name}</span>
        {badges}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold tabular-nums">{metric}</div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{metricLabel}</div>
      </div>
    </li>
  );
}

const reviewToneVar: Record<"danger" | "warning", string> = {
  danger: "var(--danger)",
  warning: "var(--warning)",
};

const lhTone: Record<LighthouseStatus, "success" | "warning" | "danger" | "neutral"> = {
  Scaling: "success",
  "Low usage": "warning",
  "No usage": "danger",
  "Expired · still using": "danger",
  Prospect: "neutral",
};

const povStatusBadge: Record<PovRow["status"], { tone: "success" | "warning" | "accent"; label: string }> = {
  "on-track": { tone: "success", label: "On track" },
  "at-risk": { tone: "warning", label: "At risk" },
  won: { tone: "accent", label: "Won" },
};

type Focus = "lighthouse" | "pov" | "attention";

export function CustomerGrowth({ customers }: { customers: GrowthCustomer[] }) {
  const [focus, setFocus] = useState<Focus | null>(null);
  const toggle = (f: Focus) => setFocus((cur) => (cur === f ? null : f));

  const counts = growthCounts(customers);
  const lighthouse = buildLighthouseList(customers);
  const pov = buildPovList(customers);
  const underutilized = buildUnderutilizedList(customers);
  const ccm = buildCcmList(customers);
  const reviewGroups = buildReviewGroups(customers);

  const showCcm = focus === null;
  const showUnder = focus === null;
  const showLighthouse = focus === null || focus === "lighthouse";
  const showPov = focus === null || focus === "pov";
  const showAttention = focus === "attention";

  return (
    <div className="flex flex-col gap-6">
      <div className="-mb-3 flex items-center gap-2 text-xs text-[var(--muted)]">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          ↓
        </span>
        Select a metric below to drill into the accounts behind it.
      </div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Lighthouse accounts"
          value={num(counts.lighthouse)}
          hint="strategic reference accounts"
          onClick={() => toggle("lighthouse")}
          active={focus === "lighthouse"}
        />
        <Stat
          label="PoVs in progress"
          value={num(counts.povInProgress)}
          tone="warning"
          hint="active proof-of-value engagements"
          onClick={() => toggle("pov")}
          active={focus === "pov"}
        />
        <Stat
          label="Customers require attention"
          value={num(counts.attention)}
          tone="danger"
          hint="needs an account-team action"
          onClick={() => toggle("attention")}
          active={focus === "attention"}
        />
      </section>

      {focus !== null ? (
        <button
          type="button"
          onClick={() => setFocus(null)}
          className="inline-flex items-center gap-1 self-start rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Clear filter · show all
        </button>
      ) : null}

      {showAttention ? (
        <Card>
          <CardHeader
            title="Accounts to review"
            subtitle="Where the account team should act now · grouped by reason"
          />
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {reviewGroups.map((g) => (
                <div
                  key={g.key}
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                >
                  <div
                    className="border-l-[3px] px-4 py-3"
                    style={{ borderColor: reviewToneVar[g.tone] }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: reviewToneVar[g.tone] }}
                        />
                        <h4 className="text-sm font-semibold">{g.title}</h4>
                      </div>
                      <Badge tone={g.tone}>{g.rows.length}</Badge>
                    </div>
                    <p
                      className="mt-1.5 inline-flex rounded-md bg-[var(--surface-2)] px-2 py-1 text-[11px] font-medium text-[var(--muted)]"
                    >
                      Action → {g.action}
                    </p>
                    <ul className="mt-2">
                      {g.rows.map((r) => (
                        <Row
                          key={r.customer}
                          name={r.customer}
                          metric={r.clients > 0 ? num(r.clients) : acvFmt.format(r.acv)}
                          metricLabel={r.clients > 0 ? "clients" : "ACV"}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {reviewGroups.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--muted)]">
                  No accounts need attention right now.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showCcm ? (
      <Card>
        <CardHeader
          title="CCM target customers"
          subtitle={`Cloud-migration targets engaged in Task Mining · ${ccm.length} accounts`}
        />
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-[var(--border)] text-xs text-[var(--muted)]">
                  <th className="px-5 py-2 text-left font-medium">Account</th>
                  <th className="px-4 py-2 text-left font-medium">Cohort</th>
                  <th className="px-4 py-2 text-left font-medium">Engagement</th>
                  <th className="px-4 py-2 text-right font-medium">Clients</th>
                  <th className="px-5 py-2 text-right font-medium">ACV</th>
                </tr>
              </thead>
              <tbody>
                {ccm.map((r) => {
                  const eng = r.prospect
                    ? { tone: "neutral" as const, label: "Prospect" }
                    : !r.active
                      ? { tone: "warning" as const, label: "Expired" }
                      : r.clients === 0
                        ? { tone: "warning" as const, label: "No usage" }
                        : { tone: "success" as const, label: "Active" };
                  return (
                    <tr key={r.customer} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-5 py-2.5 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CcmBadge />
                          <span className="truncate">{r.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {r.lighthouse ? <Badge tone="accent">Lighthouse</Badge> : null}
                          {r.pov ? <Badge tone="warning">PoV</Badge> : null}
                          {!r.lighthouse && !r.pov ? (
                            <span className="text-xs text-[var(--muted)]">—</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={eng.tone}>{eng.label}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {r.clients > 0 ? num(r.clients) : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {r.acv > 0 ? acvFmt.format(r.acv) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      ) : null}

      <section className={cn("grid grid-cols-1 gap-3", focus === null && "lg:grid-cols-3")}>
        {showUnder ? (
        <Card>
          <CardHeader
            title="Underutilized customers"
            subtitle={`Paying, under-adopting (< 25 clients) · ${underutilized.length} accounts`}
          />
          <CardContent>
            <ul>
              {underutilized.map((u) => (
                <Row
                  key={u.customer}
                  name={u.customer}
                  badges={
                    <>
                      {u.ccm ? <CcmTag /> : null}
                      {u.lighthouse ? <Badge tone="accent">Lighthouse</Badge> : null}
                      {u.pov ? <Badge tone="warning">PoV</Badge> : null}
                      {u.clients === 0 ? <Badge tone="danger">No usage</Badge> : null}
                    </>
                  }
                  metric={acvFmt.format(u.acv)}
                  metricLabel={`${num(u.clients)} clients`}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
        ) : null}

        {showLighthouse ? (
        <Card>
          <CardHeader
            title="Lighthouse accounts"
            subtitle="Strategic references · CCM targets flagged"
          />
          <CardContent>
            <ul>
              {lighthouse.map((l) => (
                <Row
                  key={l.label}
                  name={l.label}
                  badges={
                    <>
                      {l.ccm ? <CcmTag /> : null}
                      <Badge tone={lhTone[l.status]}>{l.status}</Badge>
                      {l.note ? (
                        <span className="text-[11px] text-[var(--muted)]">{l.note}</span>
                      ) : null}
                    </>
                  }
                  metric={l.clients > 0 ? num(l.clients) : "—"}
                  metricLabel="clients"
                />
              ))}
            </ul>
          </CardContent>
        </Card>
        ) : null}

        {showPov ? (
        <Card>
          <CardHeader
            title="PoV pipeline"
            subtitle="Active proofs-of-value to convert"
          />
          <CardContent>
            <ul>
              {pov.map((p) => {
                const s = povStatusBadge[p.status];
                return (
                  <Row
                    key={p.name}
                    name={
                      <>
                        {p.strategic ? <span className="text-[var(--accent)]">★ </span> : null}
                        {p.name}
                      </>
                    }
                    badges={
                      <>
                        {p.ccm ? <CcmTag /> : null}
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </>
                    }
                    metric={p.trialClients && p.trialClients > 0 ? num(p.trialClients) : "—"}
                    metricLabel="trial clients"
                  />
                );
              })}
            </ul>
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                Recently won
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POV_WON_LIST.map((w) => (
                  <Badge key={w.name} tone="success">
                    {w.name}
                    {w.note ? ` · ${w.note}` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        ) : null}
      </section>
    </div>
  );
}
