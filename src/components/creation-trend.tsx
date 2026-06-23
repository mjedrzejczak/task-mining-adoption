import type { TrendPoint } from "@/data/adoption";

export function CreationTrend({ data }: { data: TrendPoint[] }) {
  const width = 640;
  const height = 200;
  const padX = 28;
  const padY = 16;
  const max = Math.max(...data.map((d) => d.count), 1);
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const barW = innerW / data.length;
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Project creations per day in May 2026"
      >
        {[0, 0.5, 1].map((t) => {
          const y = padY + innerH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="2 3"
              />
              <text
                x={4}
                y={y + 3}
                fontSize="9"
                fill="var(--muted)"
              >
                {Math.round(max * t)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const h = (d.count / max) * innerH;
          const x = padX + i * barW + barW * 0.18;
          const y = padY + innerH - h;
          return (
            <rect
              key={d.day}
              x={x}
              y={y}
              width={barW * 0.64}
              height={Math.max(h, d.count > 0 ? 1.5 : 0)}
              rx={1.5}
              fill="var(--accent)"
            >
              <title>{`May ${d.day}: ${d.count} creations`}</title>
            </rect>
          );
        })}

        {[1, 8, 15, 22, 29].map((day) => {
          const i = day - 1;
          const x = padX + i * barW + barW / 2;
          return (
            <text
              key={day}
              x={x}
              y={height - 2}
              fontSize="9"
              fill="var(--muted)"
              textAnchor="middle"
            >
              {day}
            </text>
          );
        })}
      </svg>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {total.toLocaleString("en-US")} project creations total · x-axis = day of May
      </p>
    </div>
  );
}
