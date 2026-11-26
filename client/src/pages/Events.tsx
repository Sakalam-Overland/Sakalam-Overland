import { kindLabels } from '@shared/data';
import type { EventKind, TripEvent } from '@shared/types';
import { useMemo, useState } from 'react';
import { EventCard } from '../components/EventCard';
import { EventRow } from '../components/EventRow';
import { PageHero } from '../components/Layout';
import { Reveal } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { localDate } from '../lib/format';
import { JoinBand } from './Home';
import { usePageTitle } from '../hooks/usePageTitle';

export function Chip({ active, onClick, children, small = false }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full font-display font-semibold transition ${small ? 'px-3 py-1.5 text-xs md:text-[0.8rem]' : 'px-4 py-2 text-sm'} ${
        active ? 'bg-gubat text-puti dark:bg-dahon dark:text-itim' : 'bg-surface-2 text-ink ring-1 ring-line/10 hover:bg-tint'
      }`}
    >
      {children}
    </button>
  );
}

const monthKey = (e: TripEvent) => e.start.slice(0, 7);
const monthLabel = (key: string) => localDate(`${key}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

type View = 'list' | 'calendar';

function ViewToggle({ view, onChange, className = '' }: { view: View; onChange: (v: View) => void; className?: string }) {
  return (
    <div role="group" aria-label="Event view" className={`shrink-0 gap-1 rounded-full bg-surface-2 p-1 ring-1 ring-line/10 ${className}`}>
      {(['list', 'calendar'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-4 py-1.5 font-display text-sm font-semibold capitalize transition ${
            view === v ? 'bg-surface text-heading shadow-sm ring-1 ring-line/10' : 'text-ink-muted hover:text-heading'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export default function Events() {
  usePageTitle('Events');
  const { data, loading } = useAsync(() => api.events(), []);
  const [kind, setKind] = useState<EventKind | 'all'>('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [view, setView] = useState<View>('list');

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

      <section className="sticky top-[64px] z-30 border-b border-line/10 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 md:px-8">
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-5 py-4 [mask-image:linear-gradient(to_right,black_82%,transparent)] md:px-0 md:[mask-image:none]">
            <Chip active={kind === 'all'} onClick={() => setKind('all')}>All</Chip>
            {kinds.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                {kindLabels[k]}
              </Chip>
            ))}
            <span className="mx-2 h-6 w-px shrink-0 bg-line/15" />
            <label className="flex shrink-0 cursor-pointer items-center gap-2 font-display text-sm font-semibold text-ink">
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="h-5 w-5 accent-gubat dark:accent-dahon" />
              Spots open
            </label>
          </div>
          <ViewToggle view={view} onChange={setView} className="hidden md:flex" />
        </div>
      </section>

      <section className="bg-surface py-8 md:py-12">
        <div className="mx-auto max-w-7xl space-y-10 px-5 md:space-y-14 md:px-8">
          <ViewToggle view={view} onChange={setView} className="flex w-fit md:hidden" />
          {loading && <div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
          {!loading && groups.length === 0 && (
            <p className="lead py-20 text-center text-ink-muted">Nothing matches those filters yet. Try another category, or follow us on IG for pop-up rides.</p>
          )}
          {view === 'list' && groups.map(([key, list]) => (
            <div key={key}>
              <Reveal>
                <h2 className="flex items-baseline gap-3 text-2xl font-bold text-heading">
                  {monthLabel(key)}
                  <span className="font-body text-sm font-normal text-ink-muted">
                    {list.length} event{list.length === 1 ? '' : 's'}
                  </span>
                </h2>
              </Reveal>
              <div className="mt-5 space-y-4">
                {list.map((e, i) => (
                  <Reveal key={e.slug} delay={i * 80}>
                    <EventRow event={e} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
          {view === 'calendar' && groups.map(([key, list]) => (
            <div key={key} className="grid gap-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-3">
                <h2 className="sticky top-40 text-3xl font-bold text-heading">
                  {monthLabel(key).split(' ')[0]}
                  <span className="block text-base font-semibold text-ink-muted">{key.slice(0, 4)}</span>
                </h2>
              </Reveal>
              <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:col-span-9 xl:grid-cols-3">
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
