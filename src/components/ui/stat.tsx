import { cn } from "@/lib/cn";

type Tone = "default" | "warning" | "danger" | "success";

const valueTone: Record<Tone, string> = {
  default: "text-[var(--foreground)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
};

interface StatProps {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  // When provided, the card becomes a toggle button that drives the table
  // filter. `active` reflects the pressed state for styling + a11y.
  onClick?: () => void;
  active?: boolean;
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  onClick,
  active = false,
}: StatProps) {
  const base = "rounded-xl border bg-[var(--surface)] px-5 py-4 text-left shadow-sm";
  const borderCls = active
    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
    : "border-[var(--border)]";

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
          {label}
        </p>
        {onClick ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors",
              active
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-2)] text-[var(--muted)] group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]",
            )}
          >
            {active ? "Showing" : "View"}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        ) : null}
      </div>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", valueTone[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </>
  );

  if (!onClick) {
    return <div className={cn(base, borderCls)}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        base,
        borderCls,
        "group block w-full cursor-pointer transition-colors hover:border-[var(--accent)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
      )}
    >
      {body}
    </button>
  );
}
