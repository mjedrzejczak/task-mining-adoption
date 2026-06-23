import type { TeamRecord } from "@/data/adoption";

export type Segment = "Customer" | "Sandbox / POV" | "Internal";

const INTERNAL_EXACT = new Set([
  "prod",
  "production",
  "productive",
  "dev",
  "dev-ai",
  "dataops",
  "sandbox",
  "endpoint",
]);

const DATE_SUFFIX = /\d{4}-\d{2}-\d{2}$/;

// Best-effort classification of a @teamDomain into a business segment so the
// adoption table can be filtered down to real customers.
export function segmentOf(team: string): Segment {
  const t = team.toLowerCase();

  if (INTERNAL_EXACT.has(t)) return "Internal";
  if (t.startsWith("task-mining")) return "Internal";
  if (t.includes("celonis-com") || t.endsWith("-gmail-com")) return "Internal";

  if (
    t.includes("sandbox") ||
    t.endsWith("-sb") ||
    t.includes("pov") ||
    t.includes("trial") ||
    t.includes("training") ||
    t.includes("academic") ||
    t.includes("demo") ||
    t.endsWith("-qa") ||
    t.endsWith("-tst") ||
    t.endsWith("-dev") ||
    DATE_SUFFIX.test(t)
  ) {
    return "Sandbox / POV";
  }

  return "Customer";
}

// Turn a machine team domain into a friendlier display name.
export function displayName(team: string): string {
  return team
    .replace(/-c4c$/, "")
    .replace(/-prod$|-productive$/, "")
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export interface EnrichedTeam extends TeamRecord {
  segment: Segment;
  uploads: number;
}

export function enrich(records: TeamRecord[]): EnrichedTeam[] {
  return records.map((r) => ({
    ...r,
    segment: segmentOf(r.team),
    uploads: r.parquet + r.image,
  }));
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "k";
  return String(n);
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export const SEGMENTS: Segment[] = ["Customer", "Sandbox / POV", "Internal"];
