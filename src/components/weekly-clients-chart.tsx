import type { WeekPoint } from "@/data/adoption";

// Active Task Mining clients per week. Platform-wide series (not per-customer),
// so it is static. Partial window: earlier May weeks fall outside ~30d log
// retention.
export function WeeklyClientsChart({ data }: { data: WeekPoint[] }) {
  const max = Math.max(...data.map((d) => d.clients), 1);

  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.week} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-[var(--muted)]">{d.week}</span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-[var(--surface-2)]">
            <div
              className="h-full rounded bg-[var(--success)]"
              style={{ width: `${(d.clients / max) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-xs tabular-nums text-[var(--foreground)]">
            {d.clients.toLocaleString("en-US")}
          </span>
        </div>
      ))}
      <p className="mt-1 text-xs text-[var(--muted)]">
        Distinct active clients per ISO week · partial (≈30-day retention)
      </p>
    </div>
  );
}
