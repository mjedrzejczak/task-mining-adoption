import type { CustomerRecord } from "@/data/customers";

// Top active customers by active client count. Reactive: reflects whatever
// customers are currently in view (search + filter).
export function TopCustomersChart({
  customers,
  limit = 8,
}: {
  customers: CustomerRecord[];
  limit?: number;
}) {
  const rows = [...customers]
    .filter((c) => c.activeClients > 0)
    .sort((a, b) => b.activeClients - a.activeClients)
    .slice(0, limit);

  const max = Math.max(...rows.map((r) => r.activeClients), 1);

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted)]">
        No active clients in the current view.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((c) => (
        <div key={c.customer} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-xs text-[var(--muted)]" title={c.customer}>
            {c.customer}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-[var(--surface-2)]">
            <div
              className="h-full rounded bg-[var(--accent)]"
              style={{ width: `${(c.activeClients / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[var(--foreground)]">
            {c.activeClients.toLocaleString("en-US")}
          </span>
        </div>
      ))}
    </div>
  );
}
