import { kindLabels } from '@shared/data';
import type { TripEvent } from '@shared/types';
import { Link } from 'react-router';
import { daysUntil, fmt } from '../lib/format';
import { DifficultyBadge, Tag } from './Badges';

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

export function EventCard({ event, featured = false }: { event: TripEvent; featured?: boolean }) {
  const until = daysUntil(event.start);
  const multi = event.start !== event.end;
  return (
    <Link
      to={`/events/${event.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl p-5 transition duration-500 ease-(--ease-trail) hover:-translate-y-1 md:p-6 ${
        featured ? 'bg-gubat text-puti hover:bg-gubat-700' : 'bg-surface ring-1 ring-line/10 hover:shadow-[0_24px_60px_-30px_rgba(24,59,34,0.45)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`font-display leading-none ${featured ? 'text-puti' : 'text-heading'}`}>
          <span className="block text-4xl font-extrabold tracking-tighter tabular-nums md:text-5xl">
            {fmt.day(event.start)}
            {multi && <span className={`text-xl md:text-2xl ${featured ? 'text-puti/50' : 'text-heading/40'}`}>–{fmt.day(event.end)}</span>}
          </span>
          <span className={`eyebrow mt-2 block ${featured ? 'text-dahon' : 'text-dahon'}`}>
            {fmt.month(event.start)} · {fmt.weekday(event.start)}
          </span>
        </div>
        <Tag dark={featured}>{kindLabels[event.kind]}</Tag>
      </div>
      <h3 className="mt-4 text-lg leading-tight font-bold md:mt-5 md:text-xl">{event.title}</h3>
      <p className={`mt-2 text-sm ${featured ? 'text-puti/70' : 'text-ink-muted'}`}>{event.location}</p>
      <p className={`mt-2 line-clamp-2 text-sm ${featured ? 'text-puti/80' : 'text-ink/80'}`}>{event.summary}</p>
      <div className="mt-auto pt-4">
        <div className="mb-3 flex items-center justify-between">
          <DifficultyBadge value={event.difficulty} dark={featured} />
          {until >= 0 && until <= 30 && (
            <span className={`font-display text-xs font-semibold ${featured ? 'text-araw' : 'text-heading'}`}>
              {until === 0 ? 'Today' : `In ${until} day${until === 1 ? '' : 's'}`}
            </span>
          )}
        </div>
        <SpotsMeter event={event} dark={featured} />
      </div>
      <span
        className={`absolute top-5 right-16 hidden h-9 w-9 place-items-center md:grid rounded-full opacity-0 transition duration-500 group-hover:opacity-100 ${
          featured ? 'bg-dahon text-itim' : 'bg-gubat text-puti'
        }`}
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
