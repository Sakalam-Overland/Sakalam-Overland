import { campsites, kindLabels, trails } from '@shared/data';
import { Link, useParams } from 'react-router';
import { DifficultyBadge, StatusBadge, Tag } from '../components/Badges';
import { SpotsMeter } from '../components/EventCard';
import { Reveal } from '../components/Reveal';
import { RsvpForm } from '../components/RsvpForm';
import { HEADER_BOX, HeaderBackdrop } from '../components/Layout';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { difficultyMeta, directionsUrl, fmt, icsFor } from '../lib/format';
import { useRouteShape } from '../lib/gpx';
import NotFound from './NotFound';
import { TrailElevation } from './Trails';
import type { Trail } from '@shared/types';

/** The trail an event runs on, with whatever length, gain and elevation we know. */
function EventTrailCard({ trail }: { trail: Trail }) {
  const { shape, loading } = useRouteShape(trail);
  const facts = [
    shape.lengthMi !== undefined && `${shape.lengthMi} mi`,
    shape.gainFt !== undefined && `${shape.gainFt.toLocaleString()} ft gain`,
    trail.permit,
  ].filter(Boolean);
  return (
    <div className="card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-heading">The trail</p>
          <h2 className="mt-2 text-2xl font-bold text-heading">{trail.name}</h2>
          {facts.length > 0 && <p className="mt-1 text-sm text-ink-muted">{facts.join(' · ')}</p>}
        </div>
        <StatusBadge value={trail.status} />
      </div>
      <div className="mt-6 empty:hidden">
        <TrailElevation profile={shape.profile} name={trail.name} loading={loading} />
      </div>
      <Link to={`/trails/${trail.slug}`} className="mt-4 inline-block font-display text-sm font-semibold text-heading hover:underline">
        Full trail intel →
      </Link>
    </div>
  );
}

export default function EventDetail() {
  const { slug = '' } = useParams();
  const { data: event, error, loading, setData } = useAsync(() => api.event(slug), [slug]);

  if (error) return <NotFound what="event" />;
  if (loading || !event) return <div className="min-h-screen bg-deep" />;

  const trail = trails.find((t) => t.slug === event.trailSlug);
  const camp = campsites.find((c) => c.slug === event.campsiteSlug);

  return (
    <>
      <section className={`${HEADER_BOX} bg-deep text-puti`}>
        <HeaderBackdrop scene="event" />
        <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
          <Link to="/events" className="animate-rise font-display text-sm font-semibold text-abo transition hover:text-puti">
            ← All events
          </Link>
          <div className="mt-5 flex animate-rise flex-wrap items-center gap-3 [animation-delay:80ms]">
            <Tag dark>{kindLabels[event.kind]}</Tag>
            <DifficultyBadge value={event.difficulty} dark />
          </div>
          <h1 className="mt-4 max-w-3xl animate-rise text-4xl leading-[1.02] font-extrabold tracking-tight [animation-delay:160ms] md:text-5xl">{event.title}</h1>
          <p className="mt-5 animate-rise border-t border-puti/10 pt-4 text-sm leading-relaxed text-puti/80 [animation-delay:240ms] md:hidden">
            {fmt.range(event)} · Meet {event.meetTime} · {event.location}
          </p>
          <dl className="mt-6 hidden max-w-4xl animate-rise grid-cols-4 [animation-delay:240ms] gap-x-6 border-t border-puti/10 pt-5 md:grid">
            {[
              ['When', fmt.range(event)],
              ['Meet', event.meetTime],
              ['Where', event.location],
              ['Rig', difficultyMeta[event.difficulty].note],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow text-dahon">{k}</dt>
                <dd className="mt-1 font-display text-sm font-semibold md:text-base">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-surface py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 md:gap-14 md:px-8 lg:grid-cols-12 [&>*]:min-w-0">
          <Reveal className="space-y-10 lg:col-span-7">
            <div>
              <p className="eyebrow text-heading">The plan</p>
              <p className="lead mt-4 text-ink/85">{event.summary}</p>
            </div>
            <div>
              <p className="eyebrow text-heading">Bring</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {event.bring.map((b) => (
                  <li key={b} className="flex items-start gap-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dahon" aria-hidden />
                    <span className="font-normal">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            {trail && <EventTrailCard trail={trail} />}
            {camp && (
              <div className="flex flex-col gap-4 rounded-3xl bg-gubat p-5 text-puti md:flex-row md:items-center md:p-6">
                <img src="/icons/campsites.png" alt="" className="h-14 w-14" />
                <div className="flex-1">
                  <p className="eyebrow text-dahon">Where we sleep</p>
                  <p className="mt-1 font-display text-xl font-bold">{camp.name}</p>
                  <p className="text-sm text-puti/70">
                    {camp.sites} · {camp.fee} · {camp.access} access
                  </p>
                </div>
                <Link to="/campsites" className="btn-ghost text-puti">
                  Campsite info
                </Link>
              </div>
            )}
          </Reveal>

          <Reveal as="aside" delay={120} className="lg:col-span-5">
            <div id="rsvp" className="sticky top-28 scroll-mt-24 space-y-6 rounded-3xl bg-surface-2 p-5 md:p-6">
              <div>
                <p className="eyebrow text-heading">RSVP</p>
                <h2 className="mt-2 text-3xl font-bold text-heading">Save a spot</h2>
                <div className="mt-5">
                  <SpotsMeter event={event} />
                </div>
              </div>
              <RsvpForm event={event} onDone={setData} />
              <div className="flex flex-wrap gap-4 border-t border-line/10 pt-5 font-display text-sm font-semibold text-heading">
                <a href={icsFor(event)} download={`${event.slug}.ics`} className="hover:underline">
                  + Calendar
                </a>
                {trail && (
                  <a href={directionsUrl(trail.coords)} target="_blank" rel="noreferrer" className="hover:underline">
                    Directions
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
