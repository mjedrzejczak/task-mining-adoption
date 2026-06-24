import type { CustomerRecord } from "@/data/customers";
import type { PovHealth, PovStage } from "@/data/growth";
import { LIGHTHOUSE, PIPELINE, PIPELINE_STAGES, CCM_TARGETS } from "@/data/growth";

// The implementation stage is the "PoV cohort" that tags contracts/prospects.
const IMPLEMENTATION = PIPELINE.filter((p) => p.stage === "Implementation");

// "Today" for renewal math — aligned to the latest Datadog snapshot window.
const TODAY = new Date("2026-06-24T00:00:00");
const DAY = 86_400_000;

// A paying customer below this many active clients counts as under-adopting.
// No licensed-seat counts are available, so this is a fixed heuristic.
export const UNDERUTILIZED_MAX_CLIENTS = 25;
const EXPIRING_DAYS = 90;

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.round((new Date(iso + "T00:00:00").getTime() - TODAY.getTime()) / DAY);
}

// A contract customer enriched with the growth cohorts and a single "needs
// attention" flag, plus synthetic prospect rows for lighthouse / PoV accounts
// that have no contract record yet. This is what the consolidated table renders.
export interface GrowthCustomer extends CustomerRecord {
  lighthouse: boolean;
  pov: boolean;
  underutilized: boolean;
  ccm: boolean;
  attention: boolean;
  prospect: boolean; // no contract record (lighthouse / PoV prospect)
  trialClients: number | null;
}

// Reasons an account should be reviewed (drives the "Customers require
// attention" KPI + the Attention filter):
//   - using Task Mining but the contract expired
//   - paying contract with no usage
//   - lighthouse account with no utilisation
//   - renewal due within 90 days
function needsAttention(c: CustomerRecord, lighthouse: boolean): boolean {
  if (!c.active && c.activeClients > 0) return true;
  if (c.active && c.activeClients === 0 && c.contractValue > 0) return true;
  if (lighthouse && c.activeClients === 0) return true;
  const d = daysUntil(c.endDate);
  if (c.active && d !== null && d >= 0 && d <= EXPIRING_DAYS) return true;
  return false;
}

export function buildGrowthCustomers(
  customers: CustomerRecord[],
  teamClients: Record<string, number>,
): GrowthCustomer[] {
  const lhByName = new Map(
    LIGHTHOUSE.filter((l) => l.customer).map((l) => [l.customer as string, l]),
  );
  const povByName = new Map(
    IMPLEMENTATION.filter((p) => p.customer).map((p) => [p.customer as string, p]),
  );
  const ccmSet = new Set(CCM_TARGETS);

  const rows: GrowthCustomer[] = customers.map((c) => {
    const lh = lhByName.get(c.customer);
    const pv = povByName.get(c.customer);
    const lighthouse = !!lh;
    return {
      ...c,
      lighthouse,
      pov: !!pv,
      underutilized:
        c.active && c.contractValue > 0 && c.activeClients < UNDERUTILIZED_MAX_CLIENTS,
      ccm: (lh?.ccm ?? false) || (pv?.ccm ?? false) || ccmSet.has(c.customer),
      attention: needsAttention(c, lighthouse),
      prospect: false,
      trialClients: null,
    };
  });

  // Synthetic prospect rows — lighthouse / PoV accounts with no contract.
  const contracted = new Set(customers.map((c) => c.customer));
  const prospects = new Map<
    string,
    { label: string; lighthouse: boolean; pov: boolean; ccm: boolean; team?: string }
  >();
  for (const l of LIGHTHOUSE) {
    if (l.customer || contracted.has(l.label)) continue;
    const e = prospects.get(l.label) ?? { label: l.label, lighthouse: false, pov: false, ccm: false };
    e.lighthouse = true;
    e.ccm = e.ccm || l.ccm;
    prospects.set(l.label, e);
  }
  for (const p of IMPLEMENTATION) {
    if (p.customer || contracted.has(p.name)) continue;
    const e = prospects.get(p.name) ?? { label: p.name, lighthouse: false, pov: false, ccm: false };
    e.pov = true;
    e.ccm = e.ccm || (p.ccm ?? false);
    if (p.team) e.team = p.team;
    prospects.set(p.name, e);
  }
  for (const s of prospects.values()) {
    const trial = s.team ? teamClients[s.team] ?? 0 : 0;
    rows.push({
      customer: s.label,
      contractValue: 0,
      activeClients: trial,
      endDate: null,
      active: false,
      matchedTeams: s.team ? [s.team] : [],
      lighthouse: s.lighthouse,
      pov: s.pov,
      underutilized: false,
      ccm: s.ccm,
      attention: s.lighthouse && trial === 0,
      prospect: true,
      trialClients: s.team ? trial : null,
    });
  }
  return rows;
}

export interface GrowthCounts {
  lighthouse: number;
  povInProgress: number;
  attention: number;
}

export function growthCounts(rows: GrowthCustomer[]): GrowthCounts {
  return {
    lighthouse: rows.filter((r) => r.lighthouse).length,
    povInProgress: rows.filter((r) => r.pov).length,
    attention: rows.filter((r) => r.attention).length,
  };
}

// ---------------------------------------------------------------------------
// Actionable lists for the "Customer growth" tab. Built by joining the curated
// seed lists back to the enriched contract rows so each card shows live usage.
// ---------------------------------------------------------------------------

function rowIndex(rows: GrowthCustomer[]): Map<string, GrowthCustomer> {
  return new Map(rows.map((r) => [r.customer, r]));
}

export type LighthouseStatus =
  | "Scaling"
  | "Low usage"
  | "No usage"
  | "Expired · still using"
  | "Prospect";

export interface LighthouseRow {
  label: string;
  ccm: boolean;
  clients: number;
  status: LighthouseStatus;
  note?: string;
}

export function buildLighthouseList(rows: GrowthCustomer[]): LighthouseRow[] {
  const byName = rowIndex(rows);
  return LIGHTHOUSE.map((seed) => {
    const r = byName.get(seed.customer ?? seed.label);
    const clients = r?.activeClients ?? 0;
    const prospect = r?.prospect ?? !seed.customer;
    let status: LighthouseStatus;
    if (prospect) status = "Prospect";
    else if (r && !r.active && clients > 0) status = "Expired · still using";
    else if (clients === 0) status = "No usage";
    else if (clients < UNDERUTILIZED_MAX_CLIENTS) status = "Low usage";
    else status = "Scaling";
    return { label: seed.label, ccm: r?.ccm ?? seed.ccm, clients, status, note: seed.note };
  }).sort((a, b) => b.clients - a.clients);
}

export interface PipelineCard {
  name: string;
  health: PovHealth;
  strategic: boolean;
  ccm: boolean;
  trialClients: number | null;
  note?: string;
}

export interface PipelineColumn {
  stage: PovStage;
  label: string;
  cards: PipelineCard[];
}

// The full board, grouped by stage. Implementation cards are enriched with live
// trial-client counts where we have a Datadog team / matching contract.
export function buildPipeline(rows: GrowthCustomer[]): PipelineColumn[] {
  const byName = rowIndex(rows);
  return PIPELINE_STAGES.map((st) => ({
    stage: st.id,
    label: st.label,
    cards: PIPELINE.filter((p) => p.stage === st.id).map((p) => {
      const r = byName.get(p.customer ?? p.name);
      const trialClients =
        p.stage === "Implementation" && (p.team || r) ? r?.activeClients ?? 0 : null;
      return {
        name: p.name,
        health: p.health,
        strategic: !!p.strategic,
        ccm: p.ccm ?? r?.ccm ?? false,
        trialClients,
        note: p.note,
      };
    }),
  }));
}

export interface CcmRow {
  customer: string;
  clients: number;
  acv: number;
  lighthouse: boolean;
  pov: boolean;
  active: boolean;
  prospect: boolean;
}

// CCM target accounts we touch in Task Mining (contracts + live PoVs/prospects).
export function buildCcmList(rows: GrowthCustomer[]): CcmRow[] {
  return rows
    .filter((r) => r.ccm)
    .map((r) => ({
      customer: r.customer,
      clients: r.activeClients,
      acv: r.contractValue,
      lighthouse: r.lighthouse,
      pov: r.pov,
      active: r.active,
      prospect: r.prospect,
    }))
    .sort((a, b) => b.clients - a.clients || b.acv - a.acv);
}

export interface UnderutilizedRow {
  customer: string;
  acv: number;
  clients: number;
  ccm: boolean;
  lighthouse: boolean;
  pov: boolean;
}

export function buildUnderutilizedList(rows: GrowthCustomer[]): UnderutilizedRow[] {
  return rows
    .filter((r) => r.underutilized)
    .sort((a, b) => b.contractValue - a.contractValue)
    .map((r) => ({
      customer: r.customer,
      acv: r.contractValue,
      clients: r.activeClients,
      ccm: r.ccm,
      lighthouse: r.lighthouse,
      pov: r.pov,
    }));
}

export interface ReviewRow {
  customer: string;
  acv: number;
  clients: number;
}

export interface ReviewGroup {
  key: string;
  title: string;
  action: string;
  tone: "danger" | "warning";
  rows: ReviewRow[];
}

// Each at-risk account is bucketed once, by its most urgent reason.
export function buildReviewGroups(rows: GrowthCustomer[]): ReviewGroup[] {
  const expiredUsing: ReviewRow[] = [];
  const payingNoUsage: ReviewRow[] = [];
  const lighthouseIdle: ReviewRow[] = [];
  const renewingSoon: ReviewRow[] = [];

  for (const r of rows) {
    if (!r.attention) continue;
    const row: ReviewRow = { customer: r.customer, acv: r.contractValue, clients: r.activeClients };
    if (!r.active && r.activeClients > 0) expiredUsing.push(row);
    else if (r.active && r.activeClients === 0 && r.contractValue > 0) payingNoUsage.push(row);
    else if (r.lighthouse && r.activeClients === 0) lighthouseIdle.push(row);
    else renewingSoon.push(row);
  }

  const groups: ReviewGroup[] = [
    {
      key: "expired-using",
      title: "Using Task Mining — contract expired",
      action: "Renew now; usage proves value",
      tone: "danger",
      rows: expiredUsing.sort((a, b) => b.clients - a.clients),
    },
    {
      key: "paying-no-usage",
      title: "Paying — no usage",
      action: "Drive onboarding before renewal",
      tone: "danger",
      rows: payingNoUsage.sort((a, b) => b.acv - a.acv),
    },
    {
      key: "lighthouse-idle",
      title: "Lighthouse — no utilisation",
      action: "Protect reference; kickstart adoption",
      tone: "warning",
      rows: lighthouseIdle,
    },
    {
      key: "renewing-soon",
      title: "Renewing within 90 days",
      action: "Confirm renewal & expansion",
      tone: "warning",
      rows: renewingSoon.sort((a, b) => b.acv - a.acv),
    },
  ];
  return groups.filter((g) => g.rows.length > 0);
}
