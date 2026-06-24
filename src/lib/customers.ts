import type { GrowthCustomer } from "@/lib/growth";

export type CustomerFilter =
  | "All"
  | "Lighthouse"
  | "PoV"
  | "Underutilized"
  | "Attention"
  | "Adopting"
  | "No usage"
  | "Expired";
export type CustomerSortKey =
  | "customer"
  | "contractValue"
  | "activeClients"
  | "teams"
  | "endDate";
export type SortDir = "asc" | "desc";

export const CUSTOMER_FILTERS: CustomerFilter[] = [
  "All",
  "Lighthouse",
  "PoV",
  "Underutilized",
  "Attention",
  "Adopting",
  "No usage",
  "Expired",
];

// Growth cohorts (Lighthouse / PoV / Underutilized / Attention) come from the
// enriched flags; the contract-status filters (Adopting / No usage / Expired)
// apply only to real contracts, so synthetic prospect rows are excluded there.
export function matchesFilter(c: GrowthCustomer, f: CustomerFilter): boolean {
  switch (f) {
    case "Lighthouse":
      return c.lighthouse;
    case "PoV":
      return c.pov;
    case "Underutilized":
      return c.underutilized;
    case "Attention":
      return c.attention;
    case "Adopting":
      return c.active && c.activeClients > 0;
    case "No usage":
      return c.active && c.activeClients === 0;
    case "Expired":
      return !c.active && !c.prospect;
    default:
      return true;
  }
}

export function filterSortCustomers(
  customers: GrowthCustomer[],
  opts: {
    query: string;
    filter: CustomerFilter;
    sortKey: CustomerSortKey;
    sortDir: SortDir;
  },
): GrowthCustomer[] {
  const q = opts.query.trim().toLowerCase();
  const filtered = customers.filter((c) => {
    if (!matchesFilter(c, opts.filter)) return false;
    if (q && !c.customer.toLowerCase().includes(q)) return false;
    return true;
  });
  const dir = opts.sortDir === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    if (opts.sortKey === "customer") return a.customer.localeCompare(b.customer) * dir;
    if (opts.sortKey === "endDate") {
      return (a.endDate ?? "").localeCompare(b.endDate ?? "") * dir;
    }
    if (opts.sortKey === "teams") {
      return (a.matchedTeams.length - b.matchedTeams.length) * dir;
    }
    return (a[opts.sortKey] - b[opts.sortKey]) * dir;
  });
}

export interface CustomerKpis {
  customersInView: number;
  activeContracts: number;
  adopting: number;
  noUsage: number;
  expired: number;
  totalAcv: number;
  noUsageAcv: number;
  totalActiveClients: number;
  activeTeams: number;
}

// Contract roll-ups for the customers in view. Synthetic prospect rows (no
// contract) are excluded so the commercial figures stay clean.
export function customerKpis(rows: GrowthCustomer[]): CustomerKpis {
  const teams = new Set<string>();
  let customersInView = 0;
  let activeContracts = 0;
  let adopting = 0;
  let noUsage = 0;
  let expired = 0;
  let totalAcv = 0;
  let noUsageAcv = 0;
  let totalActiveClients = 0;

  for (const c of rows) {
    if (c.prospect) continue;
    customersInView++;
    totalAcv += c.contractValue;
    totalActiveClients += c.activeClients;
    for (const t of c.matchedTeams) teams.add(t);
    if (c.active) {
      activeContracts++;
      if (c.activeClients > 0) {
        adopting++;
      } else {
        noUsage++;
        noUsageAcv += c.contractValue;
      }
    } else {
      expired++;
    }
  }

  return {
    customersInView,
    activeContracts,
    adopting,
    noUsage,
    expired,
    totalAcv,
    noUsageAcv,
    totalActiveClients,
    activeTeams: teams.size,
  };
}

export function filterCounts(
  customers: GrowthCustomer[],
): Record<CustomerFilter, number> {
  const counts = {} as Record<CustomerFilter, number>;
  for (const f of CUSTOMER_FILTERS) {
    counts[f] = customers.filter((c) => matchesFilter(c, f)).length;
  }
  return counts;
}
