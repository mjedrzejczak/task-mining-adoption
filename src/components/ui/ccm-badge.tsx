import { cn } from "@/lib/cn";

// CCM target accounts get a deliberately prominent, distinct (violet) badge so
// they stand out from the other cohort labels.
export function CcmBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap text-white shadow-sm ring-1 ring-violet-400/40",
        className,
      )}
    >
      ★ CCM target
    </span>
  );
}
