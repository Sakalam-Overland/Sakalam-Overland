import { useEffect, useId, useMemo, useRef, useState } from 'react';

const H = 220;
const PAD = { top: 26, right: 16, bottom: 28, left: 52 };

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

/** Interpolate elevation at any mile along the profile. */
function elevationAt(profile: [number, number][], mile: number) {
  for (let i = 1; i < profile.length; i++) {
    const [m0, e0] = profile[i - 1];
    const [m1, e1] = profile[i];
    if (mile <= m1) return e0 + ((mile - m0) / (m1 - m0 || 1)) * (e1 - e0);
  }
  return profile[profile.length - 1][1];
}

export function ElevationChart({ profile, name }: { profile: [number, number][]; name: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const miles = profile.map((p) => p[0]);
    const elev = profile.map((p) => p[1]);
    const maxMile = Math.max(...miles);
    const yTicks = niceTicks(Math.min(...elev), Math.max(...elev));
    const yMin = yTicks[0];
    const yMax = yTicks[yTicks.length - 1];
    const innerW = width - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (m: number) => PAD.left + (m / maxMile) * innerW;
    const y = (e: number) => PAD.top + innerH - ((e - yMin) / (yMax - yMin || 1)) * innerH;
    const line = profile.map(([m, e], i) => `${i ? 'L' : 'M'}${x(m).toFixed(1)},${y(e).toFixed(1)}`).join('');
    const area = `${line}L${x(maxMile)},${y(yMin)}L${x(0)},${y(yMin)}Z`;
    const xTicks = niceTicks(0, maxMile, width < 480 ? 3 : 5).filter((t) => t <= maxMile);
    const peak = profile.reduce((a, b) => (b[1] > a[1] ? b : a));
    return { x, y, line, area, yTicks, xTicks, maxMile, innerW, peak };
  }, [profile, width]);

  const fromPointer = (clientX: number) => {
    const rect = wrap.current!.getBoundingClientRect();
    const m = ((clientX - rect.left - PAD.left) / geo.innerW) * geo.maxMile;
    setHover(Math.min(geo.maxMile, Math.max(0, m)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = geo.maxMile / 20;
    if (e.key === 'ArrowRight') setHover((h) => Math.min(geo.maxMile, (h ?? -step) + step));
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? step) - step));
    else if (e.key === 'Escape') setHover(null);
    else return;
    e.preventDefault();
  };

  const hv = hover === null ? null : { m: hover, e: elevationAt(profile, hover) };
  const tipLeft = hv ? Math.min(Math.max(geo.x(hv.m), PAD.left + 50), width - 70) : 0;

  return (
    <figure>
      <div
        ref={wrap}
        className="relative touch-pan-y select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-araw rounded-xl"
        tabIndex={0}
        role="img"
        aria-label={`Elevation profile for ${name}. Peak ${geo.peak[1].toLocaleString()} ft at mile ${geo.peak[0]}. Use arrow keys to step through.`}
        onPointerMove={(e) => fromPointer(e.clientX)}
        onPointerDown={(e) => fromPointer(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={H} className="block overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--color-dahon)" stopOpacity="0.35" />
              <stop offset="1" stopColor="var(--color-dahon)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {geo.yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={geo.y(t)} y2={geo.y(t)} stroke="currentColor" strokeOpacity="0.08" />
              <text x={PAD.left - 10} y={geo.y(t)} dy="0.32em" textAnchor="end" className="fill-ink-muted text-[11px] tabular-nums">
                {t.toLocaleString()}
              </text>
            </g>
          ))}
          {geo.xTicks.map((t) => (
            <text key={t} x={geo.x(t)} y={H - 8} textAnchor="middle" className="fill-ink-muted text-[11px] tabular-nums">
              {t} mi
            </text>
          ))}
          <path d={geo.area} fill={`url(#${gradId})`} />
          <path d={geo.line} fill="none" stroke="var(--color-heading)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* Direct label on the peak only */}
          {!hv && (
            <g>
              <circle cx={geo.x(geo.peak[0])} cy={geo.y(geo.peak[1])} r="4" fill="var(--color-heading)" stroke="var(--color-surface)" strokeWidth="2" />
              <text x={geo.x(geo.peak[0])} y={geo.y(geo.peak[1]) - 10} textAnchor="middle" className="fill-ink font-display text-[11px] font-semibold">
                Peak {geo.peak[1].toLocaleString()} ft
              </text>
            </g>
          )}
          {hv && (
            <g pointerEvents="none">
              <line x1={geo.x(hv.m)} x2={geo.x(hv.m)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-ink)" strokeOpacity="0.35" strokeDasharray="3 3" />
              <circle cx={geo.x(hv.m)} cy={geo.y(hv.e)} r="5" fill="var(--color-heading)" stroke="var(--color-surface)" strokeWidth="2" />
            </g>
          )}
          <text x={PAD.left - 10} y={10} textAnchor="end" className="fill-ink-muted text-[10px]">ft</text>
        </svg>
        {hv && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-itim px-3 py-1.5 font-display text-xs whitespace-nowrap text-puti shadow-lg"
            style={{ left: tipLeft }}
            aria-live="polite"
          >
            <span className="font-semibold">{Math.round(hv.e).toLocaleString()} ft</span>
            <span className="ml-2 text-abo">mile {hv.m.toFixed(1)}</span>
          </div>
        )}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-display text-xs font-semibold text-heading">View as table</summary>
        <table className="mt-2 w-full max-w-sm text-left tabular-nums">
          <thead>
            <tr className="text-ink-muted">
              <th className="py-1 font-semibold">Mile</th>
              <th className="py-1 font-semibold">Elevation (ft)</th>
            </tr>
          </thead>
          <tbody>
            {profile.map(([m, e]) => (
              <tr key={m} className="border-t border-line/10">
                <td className="py-1">{m}</td>
                <td className="py-1">{e.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
