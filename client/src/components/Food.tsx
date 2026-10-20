import { useId } from 'react';

// Flat, top-down Filipino food illustrations in the brand palette.
// Fixed colors on purpose: food should look like food in both themes.

const C = {
  leaf: '#3f8a4c',
  leafDark: '#2c6a38',
  vein: '#6cb877',
  rice: '#fbf8ef',
  riceShade: '#ece6d4',
  gold: '#e8a33a',
  goldDark: '#c27a1e',
  brown: '#7a3f22',
  brownLight: '#a65a30',
  red: '#d94a36',
  mango: '#f6c033',
  yolk: '#f08a1c',
  ube: '#7b4fa0',
  cream: '#f6efdc',
  green: '#61ab73',
  bowl: '#f4f5f1',
  bowlRim: '#d9ddd6',
};

/** One banana leaf: a long blade with a midrib and side veins. */
function Leaf({ x, y, w, h, rotate = 0 }: { x: number; y: number; w: number; h: number; rotate?: number }) {
  const veins = Array.from({ length: Math.floor(w / 14) }, (_, i) => x + 10 + i * 14);
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2.4} fill={C.leaf} />
      {veins.map((vx) => (
        <g key={vx} stroke={C.vein} strokeWidth="1" opacity="0.45">
          <path d={`M${vx},${y + h / 2} L${vx + 9},${y + 4}`} />
          <path d={`M${vx},${y + h / 2} L${vx + 9},${y + h - 4}`} />
        </g>
      ))}
      <path d={`M${x + 6},${y + h / 2} H${x + w - 6}`} stroke={C.leafDark} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function RiceMound({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const grains = Array.from({ length: 14 }, (_, i) => {
    const a = i * 2.4;
    const d = (r * 0.75 * ((i * 37) % 10)) / 10;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, (i * 53) % 180] as const;
  });
  return (
    <g>
      <ellipse cx={cx + 3} cy={cy + 5} rx={r} ry={r * 0.72} fill="#000" opacity="0.12" />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.72} fill={C.rice} />
      <ellipse cx={cx + r * 0.25} cy={cy + r * 0.2} rx={r * 0.6} ry={r * 0.4} fill={C.riceShade} opacity="0.6" />
      {grains.map(([gx, gy, a], i) => (
        <ellipse key={i} cx={gx} cy={gy} rx="3" ry="1.3" fill={C.riceShade} transform={`rotate(${a} ${gx} ${gy})`} />
      ))}
    </g>
  );
}

function LumpiaRoll({ x, y, len = 54, rotate = 0 }: { x: number; y: number; len?: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <rect x={x - len / 2} y={y - 7} width={len} height="14" rx="7" fill={C.gold} />
      <rect x={x - len / 2} y={y - 7} width={len} height="5" rx="2.5" fill="#f4bd5c" />
      {[-0.3, 0, 0.3].map((t) => (
        <path key={t} d={`M${x + t * len - 3},${y - 6} q3,6 0,12`} stroke={C.goldDark} strokeWidth="1.2" fill="none" />
      ))}
    </g>
  );
}

function Skewer({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <path d={`M${x - 46},${y} H${x + 50}`} stroke="#c9a77a" strokeWidth="2.5" strokeLinecap="round" />
      {[-30, -8, 14, 36].map((dx) => (
        <g key={dx}>
          <rect x={x + dx - 10} y={y - 9} width="20" height="18" rx="5" fill={C.brown} />
          <path d={`M${x + dx - 6},${y - 7} l4,14 M${x + dx + 2},${y - 7} l4,14`} stroke="#3e1f10" strokeWidth="2" opacity="0.5" />
          <rect x={x + dx - 10} y={y - 9} width="20" height="5" rx="2.5" fill={C.brownLight} opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

function Fish({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <path d={`M${x - 52},${y} Q${x - 10},${y - 24} ${x + 34},${y} Q${x - 10},${y + 24} ${x - 52},${y}Z`} fill="#b9c2c4" />
      <path d={`M${x + 30},${y} L${x + 54},${y - 16} L${x + 50},${y} L${x + 54},${y + 16}Z`} fill="#9aa5a8" />
      {[-30, -14, 2, 18].map((dx) => (
        <path key={dx} d={`M${x + dx},${y - 13} l-8,26`} stroke="#3e3a34" strokeWidth="3" opacity="0.55" strokeLinecap="round" />
      ))}
      <circle cx={x - 38} cy={y - 3} r="3" fill="#2a2a2a" />
    </g>
  );
}

function EggHalf({ cx, cy, r = 13 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="#fffaf0" />
      <circle cx={cx} cy={cy} r={r * 0.5} fill={C.yolk} />
    </g>
  );
}

function Tomato({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path d={`M${cx - 12},${cy} A12,12 0 0 1 ${cx + 12},${cy}Z`} fill={C.red} />
      <path d={`M${cx - 8},${cy - 2} A8,6 0 0 1 ${cx + 8},${cy - 2}`} fill="#f26a52" />
    </g>
  );
}

function Mango({ cx, cy, rotate = 0 }: { cx: number; cy: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx="24" ry="13" fill={C.mango} />
      {[-10, 0, 10].map((dx) => (
        <path key={dx} d={`M${cx + dx},${cy - 10} v20`} stroke="#e3a21a" strokeWidth="1.5" />
      ))}
      <path d={`M${cx - 18},${cy} H${cx + 18}`} stroke="#e3a21a" strokeWidth="1.5" />
    </g>
  );
}

/** A full boodle fight, laid out kamayan-style down a table of banana leaves. */
export function BoodleFight({ className = '', slice = false }: { className?: string; slice?: boolean }) {
  return (
    <svg viewBox="40 60 1120 300" preserveAspectRatio={slice ? 'xMidYMid slice' : undefined} className={className} role="img" aria-label="A boodle fight: rice, lumpia, grilled skewers, fish, eggs, tomatoes and mango on banana leaves">
      <rect width="1200" height="420" fill="#2a2016" />
      {/* Table grain */}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M0,${i * 50 + 10} C300,${i * 50 + 22} 900,${i * 50 - 4} 1200,${i * 50 + 12}`} stroke="#3a2c1e" strokeWidth="2" fill="none" />
      ))}
      <Leaf x={-40} y={40} w={1280} h={120} rotate={-1} />
      <Leaf x={-40} y={140} w={1280} h={130} rotate={0.6} />
      <Leaf x={-40} y={250} w={1280} h={120} rotate={-0.4} />

      {/* A spine of rice down the middle, with the ulam on either side */}
      {[90, 290, 490, 690, 890, 1090].map((cx, i) => (
        <RiceMound key={cx} cx={cx} cy={205 + (i % 2 ? 6 : -6)} r={46} />
      ))}
      <LumpiaRoll x={180} y={110} rotate={-12} />
      <LumpiaRoll x={200} y={132} rotate={-8} />
      <LumpiaRoll x={880} y={300} rotate={10} />
      <LumpiaRoll x={905} y={322} rotate={6} />
      <Skewer x={410} y={110} rotate={6} />
      <Skewer x={1010} y={112} rotate={-6} />
      <Skewer x={590} y={312} rotate={-4} />
      <Fish x={640} y={112} rotate={4} />
      <Fish x={240} y={310} rotate={-6} />
      {[[790, 108], [820, 128], [100, 330], [1110, 300]].map(([cx, cy]) => (
        <EggHalf key={`${cx}`} cx={cx} cy={cy} />
      ))}
      {[[60, 110], [80, 128], [1150, 120], [1130, 140], [420, 330], [440, 312], [760, 318]].map(([cx, cy]) => (
        <Tomato key={`${cx}-${cy}`} cx={cx} cy={cy} />
      ))}
      <Mango cx={1100} cy={320} rotate={-20} />
      <Mango cx={1060} cy={340} rotate={10} />
      <Mango cx={340} cy={102} rotate={14} />
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

export function Lumpia() {
  return (
    <Plate>
      <circle cx="60" cy="62" r="40" fill={C.bowl} stroke={C.bowlRim} strokeWidth="3" />
      <LumpiaRoll x={58} y={50} len={52} rotate={-20} />
      <LumpiaRoll x={62} y={66} len={52} rotate={-20} />
      <LumpiaRoll x={66} y={82} len={44} rotate={-20} />
      <circle cx="88" cy="40" r="9" fill={C.red} opacity="0.85" />
    </Plate>
  );
}

export function Pancit() {
  const noodles = Array.from({ length: 9 }, (_, i) => i);
  return (
    <Plate>
      <circle cx="60" cy="62" r="40" fill={C.bowl} stroke={C.bowlRim} strokeWidth="3" />
      {noodles.map((i) => (
        <path key={i} d={`M${32 + i * 2},${46 + i * 4} q14,-10 28,0 t28,0`} stroke="#e9c27a" strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
      <rect x="44" y="50" width="10" height="5" rx="2" fill={C.green} />
      <rect x="66" y="70" width="12" height="5" rx="2" fill="#e8553e" />
      <circle cx="84" cy="56" r="6" fill="#7fbf4d" />
      <circle cx="84" cy="56" r="3" fill="#c9e59a" />
    </Plate>
  );
}

export function HaloHalo() {
  return (
    <Plate tone="#e6e0f0">
      <path d="M38,34 H82 L76,98 Q60,104 44,98Z" fill="#f2f6fb" stroke={C.bowlRim} strokeWidth="2" />
      <path d="M41,72 H79 L76,98 Q60,104 44,98Z" fill="#e8553e" opacity="0.75" />
      <path d="M40,56 H80 L79,72 H41Z" fill="#f4e9c8" />
      <circle cx="50" cy="64" r="4" fill={C.green} />
      <circle cx="68" cy="62" r="4" fill={C.mango} />
      <circle cx="60" cy="86" r="4" fill="#fff" opacity="0.7" />
      <path d="M36,36 Q60,6 84,36Z" fill="#ffffff" />
      <circle cx="60" cy="22" r="11" fill={C.ube} />
      <rect x="64" y="10" width="20" height="6" rx="3" fill={C.gold} transform="rotate(-30 74 13)" />
    </Plate>
  );
}

export function LecheFlan() {
  return (
    <Plate>
      <ellipse cx="60" cy="68" rx="42" ry="30" fill={C.bowl} stroke={C.bowlRim} strokeWidth="3" />
      <ellipse cx="60" cy="64" rx="30" ry="21" fill="#f6c25c" />
      <ellipse cx="60" cy="58" rx="26" ry="16" fill="#b4621e" />
      <ellipse cx="54" cy="54" rx="10" ry="5" fill="#d98a3a" opacity="0.8" />
    </Plate>
  );
}

export function Adobo() {
  return (
    <Plate>
      <circle cx="60" cy="62" r="40" fill={C.bowl} stroke={C.bowlRim} strokeWidth="3" />
      <ellipse cx="44" cy="66" rx="20" ry="16" fill={C.rice} />
      {[[70, 50], [82, 64], [68, 76]].map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="12" ry="9" fill="#5a2c16" />
          <ellipse cx={x - 3} cy={y - 3} rx="5" ry="3" fill="#8a4a26" />
        </g>
      ))}
      <path d="M58,84 q10,6 26,-4" stroke="#3e1f10" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="78" cy="44" r="2" fill="#1d1d1d" />
      <path d="M86,72 l6,-4" stroke={C.green} strokeWidth="3" strokeLinecap="round" />
    </Plate>
  );
}

export function Bibingka() {
  const id = useId();
  return (
    <Plate>
      {/* Banana-leaf liner peeking out under the cake */}
      <path d="M60,14 L74,28 L94,26 L92,46 L106,60 L92,74 L94,94 L74,92 L60,106 L46,92 L26,94 L28,74 L14,60 L28,46 L26,26 L46,28Z" fill={C.leaf} />
      <defs>
        <radialGradient id={`${id}b`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#f3d27c" />
          <stop offset="1" stopColor="#c98a2e" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="34" fill={`url(#${id}b)`} />
      <ellipse cx="54" cy="56" rx="12" ry="10" fill="#fffaf0" />
      <circle cx="54" cy="56" r="5" fill={C.yolk} />
      {[[72, 48], [76, 70], [58, 78], [44, 70]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="2.5" fill="#fffaf0" opacity="0.9" />
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
