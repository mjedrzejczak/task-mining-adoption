import { cn } from "@/lib/cn";

type Tone = "default" | "warning" | "danger" | "success";

const valueTone: Record<Tone, string> = {
  default: "text-[var(--foreground)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
};

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", valueTone[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
