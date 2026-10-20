import { useId } from 'react';

// Flat, top-down Filipino food illustrations in the brand palette.
// Fixed colors on purpose: food should look like food in both themes.
// Shapes are slightly irregular (seeded, so they never change between renders)
// and each item gets one highlight and one shadow; enough to feel hand-drawn.

const C = {
  leaf: '#3f8a4c',
  leafLight: '#4b9858',
  leafDark: '#2c6a38',
  vein: '#6cb877',
  rice: '#fbf8ef',
  riceShade: '#e9e2cd',
  gold: '#e8a33a',
  goldLight: '#f6c66a',
  goldDark: '#b8701a',
  pork: '#8a3f1f',
  porkGlaze: '#b45a2c',
  char: '#2e160a',
  fat: '#e7c7a0',
  red: '#d94a36',
  mango: '#f6c033',
  mangoDark: '#dd9a14',
  yolk: '#f08a1c',
  ube: '#7b4fa0',
  cream: '#f6efdc',
  green: '#61ab73',
  bowl: '#f4f5f1',
  bowlRim: '#d9ddd6',
  ink: 'rgba(40, 24, 10, 0.18)',
};

/** Tiny seeded PRNG so every "random" wobble is the same on every render. */
function rng(seed: number) {
  let x = Math.abs(Math.sin(seed * 999.13)) * 1e4;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

/** An organic closed shape: an ellipse with a gentle wobble, drawn with smooth curves. */
function blob(cx: number, cy: number, rx: number, ry: number, seed: number, wobble = 0.08, points = 9) {
  const r = rng(seed);
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * wobble;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${mid(pts[points - 1], pts[0]).map((n) => n.toFixed(1)).join(',')}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % points]);
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  });
  return `${d}Z`;
}

/** Banana leaf with a torn, slightly ragged long edge and uneven veins. */
function Leaf({ x, y, w, h, rotate = 0, seed = 1, tone = C.leaf }: { x: number; y: number; w: number; h: number; rotate?: number; seed?: number; tone?: string }) {
  const r = rng(seed);
  const top: string[] = [];
  const bottom: string[] = [];
  for (let px = x; px <= x + w; px += 24) {
    top.push(`${px},${(y + (r() < 0.12 ? 6 + r() * 6 : r() * 3)).toFixed(1)}`);
    bottom.push(`${px},${(y + h - (r() < 0.12 ? 6 + r() * 6 : r() * 3)).toFixed(1)}`);
  }
  const outline = `M${top.join(' L')} L${bottom.reverse().join(' L')}Z`;
  const veins: number[] = [];
  for (let vx = x + 8; vx < x + w; vx += 9 + r() * 10) veins.push(vx);
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <path d={outline} fill={tone} />
      <path d={`M${x},${y + h * 0.25} H${x + w}`} stroke={C.leafLight} strokeWidth={h * 0.3} opacity="0.35" />
      {veins.map((vx) => (
        <g key={vx} stroke={C.vein} strokeWidth="0.9" opacity="0.4">
          <path d={`M${vx},${y + h / 2} L${vx + 11},${y + 5}`} />
          <path d={`M${vx},${y + h / 2} L${vx + 11},${y + h - 5}`} />
        </g>
      ))}
      <path d={`M${x + 4},${y + h / 2} H${x + w - 4}`} stroke={C.leafDark} strokeWidth="3.5" strokeLinecap="round" />
      <path d={`M${x + 4},${y + h / 2 - 1.2} H${x + w - 4}`} stroke={C.vein} strokeWidth="0.8" opacity="0.6" />
    </g>
  );
}

function Shadow({ d, dx = 3, dy = 5 }: { d: string; dx?: number; dy?: number }) {
  return <path d={d} fill="#000" opacity="0.14" transform={`translate(${dx} ${dy})`} />;
}

function RiceMound({ cx, cy, r, seed }: { cx: number; cy: number; r: number; seed: number }) {
  const rand = rng(seed);
  const shape = blob(cx, cy, r, r * 0.74, seed, 0.09);
  const grains = Array.from({ length: 26 }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.85;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.72, rand() * 180] as const;
  });
  return (
    <g>
      <Shadow d={shape} />
      <path d={shape} fill={C.rice} stroke={C.ink} strokeWidth="1" />
      <path d={blob(cx + r * 0.22, cy + r * 0.2, r * 0.62, r * 0.38, seed + 3, 0.12)} fill={C.riceShade} opacity="0.55" />
      {grains.map(([gx, gy, a], i) => (
        <ellipse key={i} cx={gx} cy={gy} rx="3.2" ry="1.3" fill={i % 3 ? C.riceShade : '#fff'} transform={`rotate(${a} ${gx} ${gy})`} />
      ))}
      {/* A few loose grains that fell off the mound */}
      {[0, 1].map((i) => {
        const gx = cx + (rand() - 0.5) * r * 1.8;
        const gy = cy + r * 0.8 + rand() * 10;
        return <ellipse key={`f${i}`} cx={gx} cy={gy} rx="2.4" ry="1" fill={C.rice} opacity="0.75" transform={`rotate(${rand() * 180} ${gx} ${gy})`} />;
      })}
    </g>
  );
}

function LumpiaRoll({ x, y, len = 54, rotate = 0, seed = 1 }: { x: number; y: number; len?: number; rotate?: number; seed?: number }) {
  const r = rng(seed);
  const h = 13;
  // Tapered, slightly bent wrapper with twisted ends
  const body = `M${x - len / 2},${y - h / 2 + 1.5} Q${x},${y - h / 2 - 1.5} ${x + len / 2},${y - h / 2 + 1} Q${x + len / 2 + 5},${y} ${x + len / 2},${y + h / 2 - 1} Q${x},${y + h / 2 + 1.5} ${x - len / 2},${y + h / 2 - 1.5} Q${x - len / 2 - 5},${y} ${x - len / 2},${y - h / 2 + 1.5}Z`;
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <Shadow d={body} dx={2} dy={3} />
      <path d={body} fill={C.gold} stroke={C.goldDark} strokeWidth="0.8" strokeOpacity="0.6" />
      <path d={`M${x - len / 2 + 3},${y - 3.5} Q${x},${y - 6} ${x + len / 2 - 3},${y - 3.5}`} stroke={C.goldLight} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Fried blisters and the wrapper seam */}
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={x - len / 2 + 6 + r() * (len - 12)} cy={y - 2 + r() * 6} r={0.7 + r() * 0.9} fill={C.goldDark} opacity="0.55" />
      ))}
      <path d={`M${x - len * 0.18},${y - h / 2 + 0.5} q4,${h / 2} 0,${h - 1}`} stroke={C.goldDark} strokeWidth="1" fill="none" opacity="0.6" />
    </g>
  );
}

/** Inihaw na baboy: glazed pork on a bamboo stick, with char from the grill. */
function Skewer({ x, y, rotate = 0, seed = 1 }: { x: number; y: number; rotate?: number; seed?: number }) {
  const r = rng(seed);
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <path d={`M${x - 50},${y + 0.5} H${x + 54}`} stroke="#c9a77a" strokeWidth="2.6" strokeLinecap="round" />
      <path d={`M${x + 46},${y + 0.5} H${x + 54}`} stroke="#8a6a44" strokeWidth="2.6" strokeLinecap="round" />
      {[-32, -10, 12, 34].map((dx, i) => {
        const piece = blob(x + dx, y, 11, 9.5, seed * 7 + i, 0.14, 7);
        return (
          <g key={dx}>
            <Shadow d={piece} dx={2} dy={3} />
            <path d={piece} fill={C.pork} />
            <path d={blob(x + dx - 2, y - 2.5, 7, 4, seed + i, 0.2, 6)} fill={C.porkGlaze} opacity="0.75" />
            {/* Fat edge on some pieces */}
            {i % 2 === 0 && <path d={`M${x + dx - 9},${y + 6} q9,4 18,0`} stroke={C.fat} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />}
            {/* Grill marks */}
            {[-4, 3].map((m) => (
              <path key={m} d={`M${x + dx + m - 3},${y - 7} l5,13`} stroke={C.char} strokeWidth="2" strokeLinecap="round" opacity={0.55 + r() * 0.25} />
            ))}
            <circle cx={x + dx - 4} cy={y - 4} r="1.4" fill="#fff" opacity="0.45" />
          </g>
        );
      })}
    </g>
  );
}

/** Inihaw na isda: whole grilled fish with fins, gill line and grill char. */
function Fish({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  const body = `M${x - 54},${y} Q${x - 30},${y - 22} ${x + 10},${y - 17} Q${x + 30},${y - 12} ${x + 36},${y} Q${x + 30},${y + 12} ${x + 10},${y + 17} Q${x - 30},${y + 22} ${x - 54},${y}Z`;
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <Shadow d={body} />
      {/* Tail and fins */}
      <path d={`M${x + 32},${y} L${x + 56},${y - 17} Q${x + 50},${y} ${x + 56},${y + 17}Z`} fill="#8f9a9d" />
      <path d={`M${x - 22},${y - 17} Q${x - 4},${y - 30} ${x + 14},${y - 16}Z`} fill="#98a3a6" />
      <path d={`M${x - 16},${y + 17} Q${x - 4},${y + 26} ${x + 8},${y + 16}Z`} fill="#98a3a6" />
      <path d={body} fill="#b9c2c4" stroke={C.ink} strokeWidth="1" />
      <path d={`M${x - 46},${y - 4} Q${x - 10},${y - 15} ${x + 28},${y - 5}`} stroke="#dfe5e6" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d={`M${x - 36},${y - 12} q-5,12 0,24`} stroke="#7c8689" strokeWidth="1.4" fill="none" />
      {[-24, -10, 4, 18].map((dx) => (
        <path key={dx} d={`M${x + dx + 3},${y - 14} l-8,28`} stroke={C.char} strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      ))}
      <circle cx={x - 44} cy={y - 3} r="3.4" fill="#f4f5f1" />
      <circle cx={x - 44} cy={y - 3} r="2" fill="#1d1d1d" />
      <circle cx={x - 44.8} cy={y - 3.8} r="0.7" fill="#fff" />
    </g>
  );
}

/** Itlog na maalat: a salted egg half, with its deep-orange yolk. */
function EggHalf({ cx, cy, r = 13, seed = 1 }: { cx: number; cy: number; r?: number; seed?: number }) {
  const white = blob(cx, cy, r, r * 0.84, seed, 0.06);
  return (
    <g>
      <Shadow d={white} dx={1.5} dy={2.5} />
      <path d={white} fill="#fffaf0" stroke={C.ink} strokeWidth="0.8" />
      <path d={blob(cx + 0.5, cy + 0.5, r * 0.5, r * 0.47, seed + 5, 0.08)} fill={C.yolk} />
      <circle cx={cx - r * 0.18} cy={cy - r * 0.18} r={r * 0.14} fill="#ffc06b" />
    </g>
  );
}

/** A tomato wedge, cut face up, with seeds. */
function Tomato({ cx, cy, rotate = 0 }: { cx: number; cy: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <path d={`M${cx - 13},${cy + 2} A13,11 0 0 1 ${cx + 13},${cy + 2}Z`} fill="#000" opacity="0.12" transform="translate(1 2)" />
      <path d={`M${cx - 13},${cy} A13,11 0 0 1 ${cx + 13},${cy}Z`} fill={C.red} />
      <path d={`M${cx - 9},${cy - 1} A9,7 0 0 1 ${cx + 9},${cy - 1}Z`} fill="#f26a52" />
      {[-5, 0, 5].map((dx) => (
        <ellipse key={dx} cx={cx + dx} cy={cy - 3.5} rx="1.3" ry="0.8" fill="#ffd9a8" />
      ))}
    </g>
  );
}

/** Calamansi half: small, bright green rind, pale segments. */
function Calamansi({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx + 1} cy={cy + 2} r="6.5" fill="#000" opacity="0.12" />
      <circle cx={cx} cy={cy} r="6.5" fill="#5f9e2f" />
      <circle cx={cx} cy={cy} r="5" fill="#e8e58a" />
      {[0, 60, 120].map((a) => (
        <path key={a} d={`M${cx},${cy - 4.5} V${cy + 4.5}`} stroke="#c9c55e" strokeWidth="0.7" transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
    </g>
  );
}

/** A mango cheek scored and pushed out "hedgehog" style. */
function Mango({ cx, cy, rotate = 0, seed = 1 }: { cx: number; cy: number; rotate?: number; seed?: number }) {
  const cheek = blob(cx, cy, 25, 14, seed, 0.06);
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <Shadow d={cheek} dx={2} dy={3} />
      <path d={cheek} fill={C.mangoDark} />
      <path d={blob(cx, cy - 1, 22.5, 11.5, seed + 2, 0.05)} fill={C.mango} />
      {[-12, -4, 4, 12].map((dx) => (
        <path key={dx} d={`M${cx + dx},${cy - 10} Q${cx + dx + 1.5},${cy} ${cx + dx},${cy + 10}`} stroke={C.mangoDark} strokeWidth="1.3" fill="none" opacity="0.7" />
      ))}
      {[-4, 4].map((dy) => (
        <path key={dy} d={`M${cx - 19},${cy + dy} Q${cx},${cy + dy + 1.5} ${cx + 19},${cy + dy}`} stroke={C.mangoDark} strokeWidth="1.3" fill="none" opacity="0.7" />
      ))}
      <ellipse cx={cx - 8} cy={cy - 6} rx="6" ry="2" fill="#fff" opacity="0.35" />
    </g>
  );
}

/** Sawsawan: a little bowl of spiced vinegar with onion and chili. */
function DipBowl({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx + 3} cy={cy + 4} r="19" fill="#000" opacity="0.16" />
      <circle cx={cx} cy={cy} r="19" fill={C.bowl} stroke={C.bowlRim} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r="14" fill="#e9dcb4" />
      <path d={`M${cx - 6},${cy - 3} a4,3 0 1 0 6,0`} stroke="#fbf6ec" strokeWidth="1.6" fill="none" />
      <path d={`M${cx + 2},${cy + 4} a3.5,2.5 0 1 0 5,0`} stroke="#fbf6ec" strokeWidth="1.6" fill="none" />
      <ellipse cx={cx + 5} cy={cy - 5} rx="2.2" ry="1.4" fill={C.red} transform={`rotate(30 ${cx + 5} ${cy - 5})`} />
      <ellipse cx={cx - 6} cy={cy + 6} rx="2" ry="1.2" fill={C.red} />
      <ellipse cx={cx - 5} cy={cy - 8} rx="5" ry="2" fill="#fff" opacity="0.4" />
    </g>
  );
}

/** A full boodle fight, laid out kamayan-style down a table of banana leaves. */
export function BoodleFight({ className = '', slice = false }: { className?: string; slice?: boolean }) {
  return (
    <svg
      viewBox="40 60 1120 300"
      preserveAspectRatio={slice ? 'xMidYMid slice' : undefined}
      className={className}
      role="img"
      aria-label="A boodle fight: rice, lumpia, grilled pork and fish, salted eggs, tomatoes, calamansi, mango and a vinegar dip on banana leaves"
    >
      <rect width="1200" height="420" fill="#2a2016" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M0,${i * 50 + 10} C300,${i * 50 + 22} 900,${i * 50 - 4} 1200,${i * 50 + 12}`} stroke="#3a2c1e" strokeWidth="2" fill="none" />
      ))}
      <Leaf x={-40} y={40} w={1280} h={122} rotate={-1} seed={2} />
      <Leaf x={-40} y={142} w={1280} h={130} rotate={0.6} seed={5} tone="#3b844a" />
      <Leaf x={-40} y={250} w={1280} h={120} rotate={-0.4} seed={9} />

      {/* Rice down the middle: same scoop, never quite the same shape */}
      {[
        [96, 200, 46],
        [288, 212, 43],
        [494, 198, 48],
        [688, 210, 44],
        [892, 199, 47],
        [1086, 211, 45],
      ].map(([cx, cy, r], i) => (
        <RiceMound key={cx} cx={cx} cy={cy} r={r} seed={i + 11} />
      ))}

      <LumpiaRoll x={176} y={108} rotate={-12} seed={1} />
      <LumpiaRoll x={198} y={131} rotate={-7} seed={2} len={50} />
      <LumpiaRoll x={884} y={298} rotate={10} seed={3} />
      <LumpiaRoll x={906} y={322} rotate={4} seed={4} len={48} />
      <Skewer x={412} y={108} rotate={6} seed={1} />
      <Skewer x={1012} y={114} rotate={-6} seed={2} />
      <Skewer x={592} y={314} rotate={-4} seed={3} />
      <Fish x={640} y={110} rotate={4} />
      <Fish x={240} y={312} rotate={-6} />
      <DipBowl cx={760} cy={318} />
      <EggHalf cx={792} cy={108} seed={1} />
      <EggHalf cx={821} cy={130} seed={2} r={12} />
      <EggHalf cx={102} cy={330} seed={3} />
      <EggHalf cx={1110} cy={298} seed={4} r={12} />
      <Tomato cx={60} cy={110} rotate={-8} />
      <Tomato cx={82} cy={130} rotate={12} />
      <Tomato cx={1150} cy={122} rotate={6} />
      <Tomato cx={1128} cy={142} rotate={-14} />
      <Tomato cx={420} cy={332} rotate={8} />
      <Tomato cx={444} cy={312} rotate={-6} />
      <Calamansi cx={296} cy={108} />
      <Calamansi cx={312} cy={120} />
      <Calamansi cx={700} cy={300} />
      <Calamansi cx={980} cy={336} />
      <Mango cx={1098} cy={322} rotate={-20} seed={1} />
      <Mango cx={1056} cy={342} rotate={10} seed={2} />
      <Mango cx={344} cy={150} rotate={14} seed={3} />
    </svg>
  );
}

// ---- Single dishes, round plates on a soft disc -------------------------------

function Plate({ children, tone = C.cream }: { children: React.ReactNode; tone?: string }) {
  return (
    <>
      <circle cx="60" cy="60" r="56" fill={tone} />
      {children}
    </>
  );
}

/** A plate seen from above: rim, a soft inner shadow and a glint. */
function Dish({ r = 40, cy = 62 }: { r?: number; cy?: number }) {
  return (
    <g>
      <circle cx="62" cy={cy + 3} r={r} fill="#000" opacity="0.08" />
      <circle cx="60" cy={cy} r={r} fill={C.bowl} stroke={C.bowlRim} strokeWidth="3" />
      <circle cx="60" cy={cy} r={r - 7} fill="none" stroke={C.bowlRim} strokeWidth="1" opacity="0.7" />
      <path d={`M${60 - r + 8},${cy - 10} A${r - 8},${r - 8} 0 0 1 ${60 - 8},${cy - r + 8}`} stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
    </g>
  );
}

export function Lumpia() {
  return (
    <Plate>
      <Dish />
      <LumpiaRoll x={54} y={50} len={50} rotate={-22} seed={6} />
      <LumpiaRoll x={58} y={66} len={50} rotate={-22} seed={7} />
      <LumpiaRoll x={62} y={82} len={42} rotate={-22} seed={8} />
      {/* Sweet chili dip */}
      <circle cx="87" cy="42" r="10" fill={C.bowl} stroke={C.bowlRim} strokeWidth="1.5" />
      <circle cx="87" cy="42" r="7" fill="#e0532f" />
      {[[85, 40], [89, 44], [88, 39]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="0.9" fill="#ffd27a" />
      ))}
    </Plate>
  );
}

export function Pancit() {
  const r = rng(4);
  return (
    <Plate>
      <Dish />
      {/* Noodles: loose overlapping strands, not stripes */}
      {Array.from({ length: 14 }, (_, i) => {
        const y = 42 + i * 3;
        const x0 = 30 + r() * 6;
        return (
          <path
            key={i}
            d={`M${x0},${y} q${8 + r() * 6},${-6 - r() * 4} ${16 + r() * 4},0 t${16 + r() * 4},0 t${14 + r() * 4},0`}
            stroke={i % 3 ? '#e9c27a' : '#d9ab5c'}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      <rect x="42" y="50" width="11" height="3.5" rx="1.5" fill="#e8733a" transform="rotate(-20 47 52)" />
      <rect x="66" y="72" width="12" height="3.5" rx="1.5" fill="#e8733a" transform="rotate(15 72 74)" />
      <path d="M48,74 q6,-6 12,0 q-6,5 -12,0Z" fill="#9fcf7a" />
      <path d="M70,52 q5,-5 10,0 q-5,4 -10,0Z" fill="#9fcf7a" />
      <rect x="58" y="58" width="9" height="5" rx="1.5" fill="#f3e3c0" stroke="#d9b98a" strokeWidth="0.6" />
      <Calamansi cx={86} cy={58} />
    </Plate>
  );
}

export function HaloHalo() {
  const r = rng(9);
  return (
    <Plate tone="#e6e0f0">
      <path d="M38,34 H82 L76,98 Q60,104 44,98Z" fill="#f2f6fb" stroke={C.bowlRim} strokeWidth="2" />
      {/* Layers, bottom up: sweet beans, nata and gulaman, milk */}
      <path d="M43.5,84 H76.5 L76,98 Q60,104 44,98Z" fill="#a8432f" opacity="0.85" />
      <path d="M42,70 H78 L76.6,84 H43.4Z" fill="#e8553e" opacity="0.7" />
      <path d="M40.6,56 H79.4 L78,70 H42Z" fill="#f4e9c8" />
      <rect x="47" y="60" width="6" height="6" rx="1" fill={C.green} opacity="0.9" />
      <rect x="64" y="62" width="6" height="6" rx="1" fill={C.mango} />
      <circle cx="57" cy="76" r="3" fill="#fff" opacity="0.7" />
      <circle cx="68" cy="88" r="2.5" fill="#5a1e12" />
      <circle cx="52" cy="90" r="2.5" fill="#5a1e12" />
      {/* Shaved ice with texture, ube and a little leche flan on top */}
      <path d="M36,36 Q40,12 60,10 Q80,12 84,36Z" fill="#ffffff" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={42 + r() * 36} cy={22 + r() * 12} r={0.8 + r()} fill="#dfe8f2" />
      ))}
      <path d={blob(55, 20, 9, 7.5, 3, 0.1)} fill={C.ube} />
      <circle cx="52" cy="17" r="2" fill="#a07cc0" />
      <rect x="64" y="20" width="10" height="7" rx="1.5" fill="#f2bf4f" />
      <rect x="64" y="20" width="10" height="2.5" rx="1" fill="#a85b1a" />
      <rect x="70" y="4" width="4" height="34" rx="2" fill="#c9cfd4" transform="rotate(25 72 21)" />
      <path d="M41,40 V94" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
    </Plate>
  );
}

export function LecheFlan() {
  return (
    <Plate>
      <ellipse cx="62" cy="71" rx="42" ry="30" fill="#000" opacity="0.08" />
      <ellipse cx="60" cy="68" rx="42" ry="30" fill={C.bowl} stroke={C.bowlRim} strokeWidth="3" />
      {/* Caramel pooling around the base */}
      <path d={blob(60, 70, 34, 22, 6, 0.08)} fill="#a8561a" opacity="0.85" />
      <ellipse cx="60" cy="66" rx="29" ry="19" fill="#f2bf4f" />
      <ellipse cx="60" cy="61" rx="25.5" ry="15.5" fill="#b4621e" />
      <path d="M40,64 q2,6 6,7 M78,64 q-1,6 -5,8" stroke="#8f4512" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="52" cy="56" rx="10" ry="4" fill="#e09a4c" opacity="0.85" />
      <ellipse cx="49" cy="55" rx="3.5" ry="1.4" fill="#fff" opacity="0.6" />
    </Plate>
  );
}

export function Adobo() {
  return (
    <Plate>
      <Dish />
      <path d={blob(44, 66, 21, 17, 2, 0.1)} fill={C.rice} stroke={C.ink} strokeWidth="0.8" />
      {[[40, 62], [48, 70], [44, 72], [38, 70], [50, 60]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.6" ry="1.1" fill={C.riceShade} transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
      {/* Sauce pooled under the meat */}
      <path d={blob(74, 64, 20, 22, 8, 0.1)} fill="#6b3a1c" opacity="0.45" />
      {[[70, 50, 1], [83, 64, 2], [69, 77, 3]].map(([x, y, s]) => (
        <g key={s}>
          <path d={blob(x, y, 10.5, 8.5, s + 20, 0.14, 7)} fill="#5a2c16" stroke="#2e160a" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d={blob(x - 2, y - 2.5, 6, 3.2, s + 30, 0.2, 6)} fill="#9c5a30" />
          <circle cx={x - 4} cy={y - 4} r="1.3" fill="#fff" opacity="0.5" />
        </g>
      ))}
      {/* Garlic, a bay leaf and peppercorns */}
      <ellipse cx="88" cy="48" rx="3" ry="2" fill="#f1dfb3" />
      <ellipse cx="60" cy="86" rx="2.6" ry="1.8" fill="#f1dfb3" />
      <path d="M78,84 q10,-6 16,-2 q-8,6 -16,2Z" fill="#6d7a3a" />
      <path d="M78,84 L93,82" stroke="#4d5a26" strokeWidth="0.8" />
      <circle cx="80" cy="44" r="1.6" fill="#1d1d1d" />
      <circle cx="91" cy="70" r="1.4" fill="#1d1d1d" />
    </Plate>
  );
}

export function Bibingka() {
  const id = useId();
  return (
    <Plate>
      {/* Banana-leaf liner peeking out under the cake */}
      <path d="M60,14 L74,28 L94,26 L92,46 L106,60 L92,74 L94,94 L74,92 L60,106 L46,92 L26,94 L28,74 L14,60 L28,46 L26,26 L46,28Z" fill={C.leaf} />
      <path d="M60,18 V102 M18,60 H102" stroke={C.vein} strokeWidth="1" opacity="0.5" />
      <defs>
        <radialGradient id={`${id}b`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#f3d27c" />
          <stop offset="1" stopColor="#c98a2e" />
        </radialGradient>
      </defs>
      <path d={blob(60, 60, 34, 33, 5, 0.04)} fill={`url(#${id}b)`} />
      {/* Charred spots from the clay pot */}
      {[[40, 46], [76, 44], [80, 74], [44, 80], [64, 84]].map(([x, y], i) => (
        <path key={i} d={blob(x, y, 3.5, 2.6, i + 40, 0.3, 6)} fill="#7a4512" opacity="0.6" />
      ))}
      {/* Salted egg slice and kesong puti */}
      <ellipse cx="53" cy="56" rx="12" ry="10" fill="#fffaf0" />
      <circle cx="53" cy="56" r="5.2" fill={C.yolk} />
      <circle cx="51.5" cy="54.5" r="1.4" fill="#ffc06b" />
      <rect x="66" y="58" width="13" height="9" rx="2" fill="#fbf6ea" transform="rotate(12 72 62)" />
      {/* Grated coconut */}
      {[[72, 46], [76, 52], [68, 76], [56, 74], [44, 66]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x},${y} l3,1`} stroke="#fffaf0" strokeWidth="1.4" strokeLinecap="round" />
      ))}
    </Plate>
  );
}

export const dishes = [
  { name: 'Lumpia', Art: Lumpia, note: "Somebody's tita always brings two hundred. They're gone by noon." },
  { name: 'Pancit', Art: Pancit, note: 'Long noodles for a long life, and for long trail days.' },
  { name: 'Adobo', Art: Adobo, note: 'Tastes better on day two of a campout. Ask anyone.' },
  { name: 'Bibingka', Art: Bibingka, note: 'Rice cake baked on banana leaf, salted egg on top. Christmas season only.' },
  { name: 'Leche flan', Art: LecheFlan, note: 'Survives a cooler better than you would think.' },
  { name: 'Halo-halo', Art: HaloHalo, note: 'For the summer beach runs. Ube on top, always.' },
] as const;
