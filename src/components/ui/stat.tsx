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
      <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
        {label}
      </p>
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
        "block w-full cursor-pointer transition-colors hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
      )}
    >
      {body}
    </button>
  );
}
