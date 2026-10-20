import type { Trail } from '@shared/types';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { DifficultyBadge, StatusBadge, Tag } from '../components/Badges';
import { ElevationChart } from '../components/ElevationChart';
import { PageHero } from '../components/Layout';
import { Reveal } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { difficultyMeta, directionsUrl, fmt } from '../lib/format';
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

function TrailDetail({ trail }: { trail: Trail }) {
  return (
    <article className="card overflow-hidden" aria-labelledby="trail-title">
      <div className="bg-gubat p-6 text-puti md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag dark>{typeLabel[trail.type]}</Tag>
          <StatusBadge value={trail.status} dark />
        </div>
        <h2 id="trail-title" className="mt-4 text-3xl font-bold md:text-4xl">
          {trail.name}
        </h2>
        <p className="mt-1 text-puti/70">
          {trail.region}, {trail.state} · {fmt.coords(trail.coords)}
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            ['Length', `${trail.lengthMi} mi`],
            ['Gain', `${trail.gainFt.toLocaleString()} ft`],
            ['From NYC', trail.driveFromNYC],
            ['Season', trail.season],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow text-dahon">{k}</dt>
              <dd className="mt-1 font-display font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="space-y-8 p-6 md:p-8">
        <div
          className={`rounded-2xl px-5 py-4 ${trail.status === 'caution' ? 'bg-araw/15' : trail.status === 'closed' ? 'bg-[#b3261e]/10' : 'bg-tint'}`}
        >
          <p className="eyebrow text-ink">Current conditions · checked {fmt.long(trail.lastVerified)}</p>
          <p className="mt-2 font-normal">{trail.statusNote}</p>
        </div>
        <p className="lead text-ink/85">{trail.summary}</p>
        <div className="text-ink">
          <p className="eyebrow mb-4 text-heading">Elevation profile</p>
          <ElevationChart profile={trail.profile} name={trail.name} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
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
            <ul className="mt-2 space-y-1.5">
              {trail.gear.map((g) => (
                <li key={g} className="flex gap-2 font-normal">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dahon" aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={directionsUrl(trail.coords)} target="_blank" rel="noreferrer" className="btn-dark">
            Directions
          </a>
          <Link to="/events" className="btn-ghost text-heading">
            Find a group ride
          </Link>
        </div>
        <p className="text-xs text-ink-muted">Conditions change fast. Always confirm with the land manager before you go.</p>
      </div>
    </article>
  );
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

      <section className="bg-surface-2 py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="rounded-3xl bg-surface p-6 ring-1 ring-line/5 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="lg:w-56">
                <p className="eyebrow text-heading">Rig matcher</p>
                <p className="mt-2 text-sm text-ink-muted">Pick your setup to see which trails are a good fit right now.</p>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Your rig">
                  {rigLevels.map((r, i) => (
                    <Chip key={r} active={rig === i} onClick={() => setRig(rig === i ? null : i)}>
                      {r}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Your experience">
                  {expLevels.map((r, i) => (
                    <Chip key={r} active={exp === i} onClick={() => setExp(i)}>
                      {r}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-2 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
              {(['all', 'offroad', 'beach', 'hike'] as const).map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>
                  {t === 'all' ? 'All' : typeLabel[t]}
                </Chip>
              ))}
            </div>
            <ul className="space-y-3">
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
                      className={`w-full rounded-2xl p-5 text-left transition ${active ? 'bg-gubat text-puti' : 'bg-surface hover:bg-tint'} ${
                        fit === 'no' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display font-semibold">{t.name}</p>
                          <p className={`mt-0.5 text-sm ${active ? 'text-puti/70' : 'text-ink-muted'}`}>
                            {typeLabel[t.type]} · {t.region}, {t.state} · {t.lengthMi} mi
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
            <div className="lg:sticky lg:top-24">
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
