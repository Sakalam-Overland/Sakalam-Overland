import { campsites, kindLabels } from '@shared/data';
import type { EventKind, TripEvent } from '@shared/types';
import { Link } from 'react-router';
import { daysUntil, fmt } from '../lib/format';
import { DifficultyBadge, Tag } from './Badges';
import { SpotsMeter } from './EventCard';
import { Photo } from './Photo';

const tones: Record<EventKind, 'forest' | 'dusk' | 'dawn' | 'night'> = {
  'group-ride': 'forest',
  campout: 'dusk',
  hike: 'dawn',
  meetup: 'night',
  'salu-salo': 'dawn',
};

/** A wide event row: date square, photo, details, then spots and the RSVP action. */
export function EventRow({ event }: { event: TripEvent }) {
  const until = daysUntil(event.start);
  const happening = until <= 0 && daysUntil(event.end) >= 0;
  const full = event.rsvps >= event.capacity;
  const image = event.image ?? campsites.find((c) => c.slug === event.campsiteSlug)?.image;
  const when = until === 0 ? 'Today' : happening ? 'Happening now' : until > 0 && until <= 30 ? `In ${until} day${until === 1 ? '' : 's'}` : null;

  return (
    <article
      className={`group relative grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-2xl bg-surface p-3 ring-1 transition duration-500 ease-(--ease-trail) sm:grid-cols-[5.5rem_9rem_minmax(0,1fr)] sm:gap-4 sm:p-4 md:hover:-translate-y-0.5 md:hover:shadow-[0_18px_36px_-24px_rgba(24,59,34,0.6)] lg:grid-cols-[6rem_11rem_minmax(0,1fr)_13rem] lg:gap-5 ${
        happening ? 'ring-2 ring-dahon' : 'ring-line/10'
      }`}
    >
      <div
        className={`flex aspect-square flex-col items-center justify-center self-start rounded-xl text-center font-display leading-none ${
          happening ? 'bg-gubat text-puti' : 'bg-tint text-heading'
        }`}
      >
        <span className="text-4xl font-extrabold tracking-tighter tabular-nums">{fmt.day(event.start)}</span>
        {event.start !== event.end && <span className="mt-0.5 text-[0.7rem] font-semibold tabular-nums">to {fmt.day(event.end)}</span>}
        <span className={`mt-1.5 text-[0.65rem] font-semibold tracking-wider uppercase ${happening ? 'text-dahon-300' : ''}`}>
          {fmt.month(event.start)} · {fmt.weekday(event.start)}
        </span>
      </div>

      <Photo name={`event-${event.slug}`} src={image} alt="" tone={tones[event.kind]} className="min-h-[5.5rem] rounded-xl lg:min-h-28" />

      <div className="col-span-2 min-w-0 sm:col-span-1 sm:self-center">
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{kindLabels[event.kind]}</Tag>
          {when && <span className={`font-display text-xs font-semibold ${happening ? 'text-heading' : 'text-ink-muted'}`}>{when}</span>}
        </div>
        <h3 className="mt-2 text-xl leading-tight font-bold text-heading md:text-2xl">
          <Link to={`/events/${event.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-normal text-ink-muted">
          {event.meetTime} · {event.location}
        </p>
        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink/80">{event.summary}</p>
      </div>

      <div className="col-span-2 flex flex-col justify-center gap-3 border-t border-line/10 pt-3 sm:col-span-3 lg:col-span-1 lg:border-t-0 lg:pt-0">
        <DifficultyBadge value={event.difficulty} />
        <SpotsMeter event={event} />
        <Link
          to={`/events/${event.slug}#rsvp`}
          className={`relative z-10 justify-center ${full ? 'btn-ghost text-heading' : 'btn bg-araw text-itim hover:bg-puti hover:ring-1 hover:ring-itim/20'}`}
        >
          {full ? 'Join waitlist' : 'RSVP'}
        </Link>
      </div>
    </article>
  );
}
