import { kindLabels } from '@shared/data';
import type { TripEvent } from '@shared/types';
import { Link } from 'react-router';
import { daysUntil, fmt } from '../lib/format';
import { DifficultyBadge } from './Badges';

export function SpotsMeter({ event, dark = false }: { event: TripEvent; dark?: boolean }) {
  const left = Math.max(0, event.capacity - event.rsvps);
  const pct = Math.min(100, (event.rsvps / event.capacity) * 100);
  return (
    <div>
      <div className={`h-1.5 overflow-hidden rounded-full ${dark ? 'bg-puti/10' : 'bg-line/10'}`}>
        <div className={`h-full rounded-full ${left === 0 ? 'bg-araw' : 'bg-dahon'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-2 font-display text-xs font-semibold ${dark ? 'text-puti/70' : 'text-ink-muted'}`}>
        {left === 0 ? 'Full · waitlist open' : `${left} of ${event.capacity} spots left`}
      </p>
    </div>
  );
}

/** A tear-off calendar page: binder rings, a month band, the date big on the left. */
export function EventCard({ event, featured = false }: { event: TripEvent; featured?: boolean }) {
  const until = daysUntil(event.start);
  const multi = event.start !== event.end;
  const year = event.start.slice(0, 4);
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group relative flex w-full flex-col rounded-2xl bg-surface pt-2 shadow-[0_14px_30px_-20px_rgba(24,59,34,0.55)] ring-1 ring-line/10 transition duration-500 ease-(--ease-trail) hover:-translate-y-1 hover:shadow-[0_24px_44px_-24px_rgba(24,59,34,0.6)]"
    >
      {/* Binder rings */}
      {['left-6', 'right-6'].map((pos) => (
        <span key={pos} aria-hidden className={`absolute -top-1.5 ${pos} z-10 h-4 w-2 rounded-full bg-gradient-to-b from-[#e7eae6] to-[#8b918d] ring-1 ring-black/10`} />
      ))}
      <div className={`mx-2 flex items-center justify-between rounded-xl px-3.5 py-2 ${featured ? 'bg-araw text-itim' : 'bg-gubat text-puti'}`}>
        <span className="font-display text-xs font-bold tracking-[0.3em] uppercase">
          {fmt.month(event.start)} {year}
        </span>
        <span className={`rounded-full px-2 py-0.5 font-display text-[0.65rem] font-semibold ${featured ? 'bg-itim/10' : 'bg-puti/15'}`}>
          {kindLabels[event.kind]}
        </span>
      </div>

      <div className="grid grid-cols-[4.25rem_1fr] gap-3 border-b border-dashed border-line/15 px-4 pt-3 pb-3.5">
        <div className="text-center font-display leading-none text-heading">
          <span className="block text-[2.6rem] font-extrabold tracking-tighter tabular-nums">{fmt.day(event.start)}</span>
          {multi && <span className="mt-0.5 block text-xs font-semibold text-ink-muted tabular-nums">to {fmt.day(event.end)}</span>}
          <span className="mt-1 block text-[0.65rem] font-semibold tracking-[0.2em] text-dahon uppercase">{fmt.weekday(event.start)}</span>
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base leading-tight font-bold text-heading md:text-lg">{event.title}</h3>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {event.meetTime} · {event.location}
          </p>
          <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink/80">{event.summary}</p>
        </div>
      </div>

      <div className="mt-auto px-4 pt-3 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <DifficultyBadge value={event.difficulty} />
          {until >= 0 && until <= 30 && (
            <span className="rounded-full bg-tint px-2 py-0.5 font-display text-[0.65rem] font-semibold text-heading">
              {until === 0 ? 'Today' : `In ${until} day${until === 1 ? '' : 's'}`}
            </span>
          )}
        </div>
        <SpotsMeter event={event} />
      </div>
    </Link>
  );
}
