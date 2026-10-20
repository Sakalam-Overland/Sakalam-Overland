import { kindLabels } from '@shared/data';
import type { EventKind, TripEvent } from '@shared/types';
import { useMemo, useState } from 'react';
import { EventCard } from '../components/EventCard';
import { PageHero } from '../components/Layout';
import { Reveal } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { localDate } from '../lib/format';
import { JoinBand } from './Home';

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 font-display text-sm font-semibold transition ${
        active ? 'bg-gubat text-puti' : 'bg-surface-2 text-ink hover:bg-tint'
      }`}
    >
      {children}
    </button>
  );
}

const monthKey = (e: TripEvent) => e.start.slice(0, 7);
const monthLabel = (key: string) => localDate(`${key}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function Events() {
  const { data, loading } = useAsync(() => api.events(), []);
  const [kind, setKind] = useState<EventKind | 'all'>('all');
  const [openOnly, setOpenOnly] = useState(false);

  const groups = useMemo(() => {
    const list = (data ?? []).filter((e) => (kind === 'all' || e.kind === kind) && (!openOnly || e.rsvps < e.capacity));
    const map = new Map<string, TripEvent[]>();
    for (const e of list) map.set(monthKey(e), [...(map.get(monthKey(e)) ?? []), e]);
    return [...map.entries()];
  }, [data, kind, openOnly]);

  const kinds = Object.keys(kindLabels) as EventKind[];

  return (
    <>
      <PageHero scene="events" eyebrow="Events" tagalog="Mga lakad" icon="events" title={<>Ride with us.</>}>
        Group rides sorted by difficulty, campouts, sunrise hikes, recovery clinics and the occasional boodle fight. Spots are capped so every
        convoy stays tight and every first-timer gets a lead rig.
      </PageHero>

      <section className="sticky top-[64px] z-30 border-b border-line/10 bg-puti/90 backdrop-blur-md">
        <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-4 md:px-8">
          <Chip active={kind === 'all'} onClick={() => setKind('all')}>All</Chip>
          {kinds.map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
              {kindLabels[k]}
            </Chip>
          ))}
          <span className="mx-2 h-6 w-px shrink-0 bg-line/15" />
          <label className="flex shrink-0 cursor-pointer items-center gap-2 font-display text-sm font-semibold text-ink">
            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="h-4 w-4 accent-gubat" />
            Spots open
          </label>
        </div>
      </section>

      <section className="bg-surface py-10 md:py-24">
        <div className="mx-auto max-w-7xl space-y-20 px-5 md:px-8">
          {loading && <div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
          {!loading && groups.length === 0 && (
            <p className="lead py-20 text-center text-ink-muted">Nothing matches those filters yet. Try another category, or follow us on IG for pop-up rides.</p>
          )}
          {groups.map(([key, list]) => (
            <div key={key} className="grid gap-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-3">
                <h2 className="sticky top-40 text-3xl font-bold text-heading">
                  {monthLabel(key).split(' ')[0]}
                  <span className="block text-base font-semibold text-ink-muted">{key.slice(0, 4)}</span>
                </h2>
              </Reveal>
              <div className="grid gap-5 md:grid-cols-2 lg:col-span-9">
                {list.map((e, i) => (
                  <Reveal key={e.slug} delay={i * 80} className="flex">
                    <EventCard event={e} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <JoinBand />
    </>
  );
}
