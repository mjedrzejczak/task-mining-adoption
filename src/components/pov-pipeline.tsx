import type { PipelineColumn, PipelineCard } from "@/lib/growth";
import type { PovHealth } from "@/data/growth";
import { CcmBadge } from "@/components/ui/ccm-badge";
import { cn } from "@/lib/cn";

// Card colour echoes the board: blue = on-track, amber = at-risk, green = won.
const healthCard: Record<PovHealth, string> = {
  "on-track": "bg-[var(--accent-soft)] border-[var(--accent)]/40",
  "at-risk": "bg-[var(--warning)]/15 border-[var(--warning)]/50",
  won: "bg-[var(--success)]/15 border-[var(--success)]/50",
  neutral: "bg-[var(--surface-2)] border-[var(--border)]",
};

const LEGEND: { health: PovHealth; label: string }[] = [
  { health: "on-track", label: "On track" },
  { health: "at-risk", label: "At risk" },
  { health: "won", label: "Won" },
  { health: "neutral", label: "Open" },
];

function Card({ card }: { card: PipelineCard }) {
  return (
    <div className={cn("rounded-lg border px-3 py-2", healthCard[card.health])}>
      <div className="flex flex-wrap items-center gap-1.5">
        {card.strategic ? <span className="text-[var(--accent)]">★</span> : null}
        <span className="text-sm font-medium text-[var(--foreground)]">{card.name}</span>
        {card.ccm ? <CcmBadge /> : null}
      </div>
      {card.note ? (
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">{card.note}</p>
      ) : null}
      {card.trialClients && card.trialClients > 0 ? (
        <p className="mt-0.5 text-[11px] font-medium text-[var(--foreground)]">
          {card.trialClients.toLocaleString("en-US")} trial clients
        </p>
      ) : null}
    </div>
  );
}

export function PovPipeline({ columns }: { columns: PipelineColumn[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted)]">
        {LEGEND.map((l) => (
          <span key={l.health} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm border", healthCard[l.health])} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[920px] grid-cols-5 gap-3">
          {columns.map((col) => (
            <div key={col.stage} className="flex flex-col">
              <div className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2 text-white">
                <span className="text-xs font-semibold">{col.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 text-xs font-semibold tabular-nums">
                  {col.cards.length}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {col.cards.map((card) => (
                  <Card key={card.name} card={card} />
                ))}
                {col.cards.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-[var(--muted)]">—</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
