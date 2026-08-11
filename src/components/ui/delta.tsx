import { cn } from "@/lib/cn";

// A small month-over-month change indicator. Colour encodes good/bad (an
// increase is not always "good" — e.g. ACV at risk), and an arrow + text label
// carry the same meaning without relying on colour alone (WCAG).
export function Delta({
  value,
  goodWhenUp = true,
  format = (n) => n.toLocaleString("en-US"),
  suffix = "vs last mo",
  size = "md",
}: {
  value: number;
  goodWhenUp?: boolean;
  format?: (n: number) => string;
  suffix?: string;
  size?: "sm" | "md";
}) {
  const flat = value === 0;
  const up = value > 0;
  const good = up === goodWhenUp;
  const tone = flat
    ? "text-[var(--muted)]"
    : good
      ? "text-[var(--success)]"
      : "text-[var(--danger)]";
  const arrow = flat ? "±" : up ? "▲" : "▼";
  const sign = up ? "+" : value < 0 ? "−" : "";
  const label = flat
    ? `No change ${suffix}`
    : `${up ? "Up" : "Down"} ${format(Math.abs(value))} ${suffix}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums",
        size === "sm" ? "text-[11px]" : "text-xs",
        tone,
      )}
      title={label}
      aria-label={label}
    >
      <span aria-hidden>{arrow}</span>
      <span>
        {flat ? "0" : `${sign}${format(Math.abs(value))}`}
      </span>
      {suffix ? (
        <span className="font-normal text-[var(--muted)]">{suffix}</span>
      ) : null}
    </span>
  );
}
