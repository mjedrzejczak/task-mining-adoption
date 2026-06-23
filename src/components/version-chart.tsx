import type { VersionPoint } from "@/data/adoption";

export function VersionChart({ data }: { data: VersionPoint[] }) {
  const rows = data.slice(0, 8);
  const max = Math.max(...rows.map((d) => d.clients), 1);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((d) => (
        <div key={d.version} className="flex items-center gap-3">
          <span className="w-20 shrink-0 font-mono text-xs text-[var(--muted)]">
            {d.version}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-[var(--surface-2)]">
            <div
              className="h-full rounded bg-[var(--accent)]"
              style={{ width: `${(d.clients / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[var(--foreground)]">
            {d.clients}
          </span>
        </div>
      ))}
      <p className="mt-1 text-xs text-[var(--muted)]">
        Distinct clients per recorder version (top 8)
      </p>
    </div>
  );
}
