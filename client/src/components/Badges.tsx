import type { Difficulty, TrailStatus } from '@shared/types';
import { difficultyMeta } from '../lib/format';

/** Difficulty as filled pips plus a label, so it never relies on color alone. */
export function DifficultyBadge({ value, dark = false }: { value: Difficulty; dark?: boolean }) {
  const { label, level } = difficultyMeta[value];
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xs font-semibold ${dark ? 'text-puti' : 'text-uling'}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-3 w-1.5 rounded-sm ${i <= level ? (dark ? 'bg-dahon' : 'bg-gubat') : dark ? 'bg-puti/15' : 'bg-uling/15'}`}
          />
        ))}
      </span>
      {label}
    </span>
  );
}

const statusMeta: Record<TrailStatus, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-dahon/15 text-gubat ring-dahon/40' },
  caution: { label: 'Caution', cls: 'bg-araw/20 text-[#7a5600] ring-araw/50' },
  seasonal: { label: 'Seasonal', cls: 'bg-uling/10 text-uling ring-uling/20' },
  closed: { label: 'Closed', cls: 'bg-[#b3261e]/10 text-[#8c1d18] ring-[#b3261e]/30' },
};

const darkStatus: Record<TrailStatus, string> = {
  open: 'bg-dahon/20 text-dahon ring-dahon/40',
  caution: 'bg-araw/15 text-araw ring-araw/40',
  seasonal: 'bg-puti/10 text-puti/80 ring-puti/20',
  closed: 'bg-[#f2b8b5]/15 text-[#f2b8b5] ring-[#f2b8b5]/30',
};

export function StatusBadge({ value, dark = false }: { value: TrailStatus; dark?: boolean }) {
  const s = statusMeta[value];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[0.7rem] font-semibold ring-1 ${dark ? darkStatus[value] : s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}

export function Tag({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-display text-[0.7rem] font-semibold ${
        dark ? 'bg-puti/10 text-puti' : 'bg-dahon-100 text-gubat'
      }`}
    >
      {children}
    </span>
  );
}
