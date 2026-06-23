import type { CustomerRecord } from "@/data/customers";

export type CustomerFilter = "All" | "Active" | "Adopting" | "No usage" | "Expired";
export type CustomerSortKey = "customer" | "contractValue" | "activeClients" | "endDate";
export type SortDir = "asc" | "desc";

export const CUSTOMER_FILTERS: CustomerFilter[] = [
  "All",
  "Active",
  "Adopting",
  "No usage",
  "Expired",
];

// A customer is "adopting" when they hold an active contract and have at least
// one active client; "No usage" is an active contract with zero active clients.
export function matchesFilter(c: CustomerRecord, f: CustomerFilter): boolean {
  switch (f) {
    case "Active":
      return c.active;
    case "Expired":
      return !c.active;
    case "Adopting":
      return c.active && c.activeClients > 0;
    case "No usage":
      return c.active && c.activeClients === 0;
    default:
      return true;
  }
}

export function filterSortCustomers(
  customers: CustomerRecord[],
  opts: {
    query: string;
    filter: CustomerFilter;
    sortKey: CustomerSortKey;
    sortDir: SortDir;
  },
): CustomerRecord[] {
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

// Roll up KPIs for whatever set of customers is currently in view.
export function customerKpis(rows: CustomerRecord[]): CustomerKpis {
  const teams = new Set<string>();
  let activeContracts = 0;
  let adopting = 0;
  let noUsage = 0;
  let expired = 0;
  let totalAcv = 0;
  let noUsageAcv = 0;
  let totalActiveClients = 0;

  for (const c of rows) {
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
    customersInView: rows.length,
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
  customers: CustomerRecord[],
): Record<CustomerFilter, number> {
  const counts: Record<CustomerFilter, number> = {
    All: customers.length,
    Active: 0,
    Adopting: 0,
    "No usage": 0,
    Expired: 0,
  };
  for (const c of customers) {
    if (c.active) {
      counts.Active++;
      if (c.activeClients > 0) counts.Adopting++;
      else counts["No usage"]++;
    } else {
      counts.Expired++;
    }
  }
  return counts;
}
