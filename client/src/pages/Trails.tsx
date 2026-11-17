import type { Trail } from '@shared/types';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { DifficultyBadge, StatusBadge, Tag } from '../components/Badges';
import { ElevationChart } from '../components/ElevationChart';
import { PageHero } from '../components/Layout';
import { Reveal } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { difficultyMeta, directionsUrl, fmt, localDate } from '../lib/format';
import { useRouteShape } from '../lib/gpx';
import { Chip } from './Events';

const rigLevels = ['Stock AWD / crossover', 'Stock 4x4', 'Lifted + all-terrains', 'Built: lockers, armor'];
const expLevels = ['New to this', 'A few trips', 'Seasoned'];

type Fit = 'good' | 'stretch' | 'no';

/**
 * Rough fit score. Off-road and beach trails are limited by the rig;
 * hikes and the hardest lines are limited by experience.
 */
export function fitFor(t: Trail, rig: number, exp: number): Fit {
  const need = difficultyMeta[t.difficulty].level;
  const cap = t.type === 'hike' ? exp + 1 : Math.min(rig + 1, exp + 2);
  if (need <= cap) return 'good';
  if (need === cap + 1) return 'stretch';
  return 'no';
}

const fitMeta: Record<Fit, { label: string; cls: string }> = {
  good: { label: 'Good fit', cls: 'bg-dahon text-itim' },
  stretch: { label: 'Stretch: go with a lead rig', cls: 'bg-araw text-itim' },
  no: { label: 'Not yet', cls: 'bg-line/10 text-ink-muted' },
};

const typeLabel: Record<Trail['type'], string> = { offroad: 'Off-road', hike: 'Hike', beach: 'Beach' };

/** The elevation chart, a placeholder while a GPX file loads, or nothing when there's no data. */
export function TrailElevation({ profile, name, loading, height }: { profile: [number, number][]; name: string; loading: boolean; height?: number }) {
  if (loading) {
    return (
      <div className="text-ink">
        <p className="eyebrow mb-3 text-heading">Elevation profile</p>
        <div className="animate-pulse rounded-xl bg-tint" style={{ height: height ?? 220 }} aria-label="Loading elevation profile" />
      </div>
    );
  }
  if (profile.length < 2) return null;
  return (
    <div className="text-ink">
      <p className="eyebrow mb-3 text-heading">Elevation profile</p>
      <ElevationChart profile={profile} name={name} height={height} />
    </div>
  );
}

function TrailDetail({ trail }: { trail: Trail }) {
  const { shape, loading } = useRouteShape(trail);
  const stats = [
    ['Length', shape.lengthMi !== undefined ? `${shape.lengthMi} mi` : null],
    ['Gain', shape.gainFt !== undefined ? `${shape.gainFt.toLocaleString()} ft` : null],
    ['From NYC', trail.driveFromNYC],
    ['Season', trail.season],
  ].filter((s): s is [string, string] => !!s[1]);
  return (
    <article className="card overflow-hidden" aria-labelledby="trail-title">
      <div className="bg-gubat px-5 py-4 text-puti md:px-6 md:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Tag dark>{typeLabel[trail.type]}</Tag>
          <StatusBadge value={trail.status} dark />
        </div>
        <h2 id="trail-title" className="mt-2.5 text-xl leading-tight font-bold md:text-2xl">
          {trail.name}
        </h2>
        <p className="mt-0.5 text-sm text-puti/70">
          {trail.region}, {trail.state} · {fmt.coords(trail.coords)}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow text-dahon-300">{k}</dt>
              <dd className="mt-0.5 font-display text-sm font-semibold md:text-base">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={directionsUrl(trail.coords)} target="_blank" rel="noreferrer" className="btn-sun !px-4 !py-2 text-[0.8rem]">
            Directions <span aria-hidden>→</span>
          </a>
          <Link to="/events" className="btn-ghost !px-4 !py-2 text-[0.8rem] text-puti">
            Find a group ride
          </Link>
        </div>
      </div>
      <div className="space-y-5 p-5 md:p-6 lg:space-y-4 lg:p-5 xl:p-6">
        <div
          className={`rounded-2xl px-4 py-3 md:px-5 md:py-4 ${trail.status === 'caution' ? 'bg-araw/15' : trail.status === 'closed' ? 'bg-[#b3261e]/10' : 'bg-tint'}`}
        >
          <p className="eyebrow text-ink">Current conditions · checked {localDate(trail.lastVerified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-2 font-normal">{trail.statusNote}</p>
        </div>
        <p className="text-[0.95rem] leading-relaxed text-ink/85">{trail.summary}</p>
        <TrailElevation profile={shape.profile} name={trail.name} loading={loading} height={160} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="eyebrow text-heading">Permit and access</p>
            <p className="mt-2 font-normal">{trail.permit}</p>
            <div className="mt-4">
              <DifficultyBadge value={trail.difficulty} />
              <p className="mt-1 text-sm text-ink-muted">{difficultyMeta[trail.difficulty].note}</p>
            </div>
          </div>
          <div>
            <p className="eyebrow text-heading">Gear list</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {trail.gear.map((g, i) => (
                <li key={`${i}-${g}`} className="rounded-full bg-tint px-3 py-1 text-sm font-normal text-heading">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-ink-muted">Conditions change fast. Always confirm with the land manager before you go.</p>
      </div>
    </article>
  );
}

/** " · 9.4 mi" in the trail list, or nothing when the length isn't known. */
function TrailLength({ trail }: { trail: Trail }) {
  const { shape } = useRouteShape(trail);
  return shape.lengthMi !== undefined ? <> · {shape.lengthMi} mi</> : null;
}

export default function Trails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data } = useAsync(() => api.trails(), []);
  const [type, setType] = useState<Trail['type'] | 'all'>('all');
  const [rig, setRig] = useState<number | null>(null);
  const [exp, setExp] = useState(1);

  const list = useMemo(() => (data ?? []).filter((t) => type === 'all' || t.type === type), [data, type]);
  const selected = data?.find((t) => t.slug === slug) ?? list[0];

  const sorted = useMemo(() => {
    if (rig === null) return list;
    const order: Record<Fit, number> = { good: 0, stretch: 1, no: 2 };
    return [...list].sort((a, b) => order[fitFor(a, rig, exp)] - order[fitFor(b, rig, exp)]);
  }, [list, rig, exp]);

  return (
    <>
      <PageHero scene="trails" eyebrow="Trails" tagalog="Daan" icon="trails" title={<>Trail intel you can trust.</>}>
        Status, permits, gear and elevation for the routes we run, checked by members who just drove or hiked them. Tell us about your rig and we'll
        sort the list by what fits.
      </PageHero>

      <section className="bg-surface-2 py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="rounded-2xl bg-surface px-4 py-3.5 ring-1 ring-line/5 md:px-5 md:py-4">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="eyebrow text-heading">Rig matcher</span>
              <span className="text-xs text-ink-muted md:text-sm">Pick your setup to see which trails fit.</span>
            </p>
            <div className="mt-3 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-4">
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Your rig">
                <span className="mr-1 w-full shrink-0 font-display text-xs font-semibold text-ink-muted sm:w-20 xl:w-auto">Rig</span>
                {rigLevels.map((r, i) => (
                  <Chip small key={r} active={rig === i} onClick={() => setRig(rig === i ? null : i)}>
                    {r}
                  </Chip>
                ))}
              </div>
              <span className="hidden h-5 w-px bg-line/15 xl:block" aria-hidden />
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Your experience">
                <span className="mr-1 w-full shrink-0 font-display text-xs font-semibold text-ink-muted sm:w-20 xl:w-auto">Experience</span>
                {expLevels.map((r, i) => (
                  <Chip small key={r} active={exp === i} onClick={() => setExp(i)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-2 pb-16 md:pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 md:px-8 lg:grid-cols-12 [&>*]:min-w-0">
          <div className="lg:col-span-5">
            <div className="no-scrollbar -m-1 mb-3 flex gap-2 overflow-x-auto p-1">
              {(['all', 'offroad', 'beach', 'hike'] as const).map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>
                  {t === 'all' ? 'All' : typeLabel[t]}
                </Chip>
              ))}
            </div>
            <ul className="space-y-2">
              {sorted.map((t, i) => {
                const fit = rig === null ? null : fitFor(t, rig, exp);
                const active = selected?.slug === t.slug;
                return (
                  <Reveal as="li" key={t.slug} delay={i * 60}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/trails/${t.slug}`, { replace: true, preventScrollReset: true });
                        if (window.innerWidth < 1024) document.getElementById('trail-detail')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      aria-current={active}
                      className={`w-full rounded-2xl px-4 py-3.5 text-left transition ${active ? 'bg-gubat text-puti' : 'bg-surface hover:bg-tint'} ${
                        fit === 'no' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display font-semibold">{t.name}</p>
                          <p className={`mt-0.5 text-sm ${active ? 'text-puti/70' : 'text-ink-muted'}`}>
                            {typeLabel[t.type]} · {t.region}, {t.state}
                            <TrailLength trail={t} />
                          </p>
                        </div>
                        <StatusBadge value={t.status} dark={active} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <DifficultyBadge value={t.difficulty} dark={active} />
                        {fit && <span className={`rounded-full px-2.5 py-1 font-display text-[0.7rem] font-semibold ${fitMeta[fit].cls}`}>{fitMeta[fit].label}</span>}
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </ul>
          </div>
          <div id="trail-detail" className="scroll-mt-24 lg:col-span-7">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-3xl lg:[scrollbar-width:thin]">
              {selected && (
                <div key={selected.slug} className="animate-[page-in_0.6s_var(--ease-trail)_backwards]">
                  <TrailDetail trail={selected} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
