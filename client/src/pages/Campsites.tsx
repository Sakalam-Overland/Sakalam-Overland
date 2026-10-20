import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Tag } from '../components/Badges';
import { PageHero } from '../components/Layout';
import { LogoMark } from '../components/SunMark';
import { Photo } from '../components/Photo';
import { Reveal, SectionHead } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { directionsUrl, fmt } from '../lib/format';

const checklist = {
  Shelter: ['Tent or rooftop tent', 'Sleeping bag rated 10° below forecast', 'Pad', 'Camp chair'],
  Kitchen: ['Stove + fuel', 'Rice (non-negotiable)', 'Cooler with ice', 'Water: 1 gal per person/day', 'Trash bags (pack it out)'],
  Rig: ['Tire deflator + compressor', 'Recovery kit', 'Spare tire + jack', 'Full tank'],
  Safety: ['First aid kit', 'Headlamp + spare batteries', 'Offline maps', 'GMRS radio'],
};
const allItems = Object.values(checklist).flat();
const KEY = 'sakalam:camp-checklist';

function Checklist() {
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      /* storage unavailable: checklist still works for this visit */
    }
  }, [done]);

  const toggle = (item: string) => setDone((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]));
  const pct = Math.round((done.length / allItems.length) * 100);

  // Shaped like a backpack: haul loop, lid with a sewn patch, straps and buckles,
  // a zippered main compartment, side pockets and a front pocket.
  return (
    <div className="relative pt-12">
      <div aria-hidden className="absolute top-0 left-1/2 h-16 w-32 -translate-x-1/2 rounded-t-full border-[12px] border-b-0 border-gubat-900" />
      {(['left', 'right'] as const).map((side) => (
        <div
          key={side}
          aria-hidden
          className={`absolute top-48 bottom-24 hidden w-14 bg-gubat-700 md:block ${side === 'left' ? 'left-0 rounded-l-[2rem]' : 'right-0 rounded-r-[2rem]'}`}
        >
          <div className={`absolute inset-2 border border-dashed border-puti/15 ${side === 'left' ? 'rounded-l-[1.6rem] border-r-0' : 'rounded-r-[1.6rem] border-l-0'}`} />
          <div className="absolute inset-x-0 top-1/3 h-3 bg-gubat-900" />
          <div className="absolute inset-x-0 top-2/3 h-3 bg-gubat-900" />
        </div>
      ))}

      <div className="relative overflow-hidden rounded-t-[4rem] rounded-b-[2.75rem] bg-gubat text-puti shadow-[0_40px_80px_-40px_rgba(14,38,21,0.7)] md:mx-6">
        <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.03]" />

        {/* Lid */}
        <div className="relative rounded-b-[2.5rem] bg-gubat-900 px-6 pt-10 pb-10 md:px-14">
          <div aria-hidden className="pointer-events-none absolute inset-3 rounded-t-[3.4rem] rounded-b-[2.1rem] border border-dashed border-puti/20" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gubat ring-2 ring-puti/15 ring-offset-4 ring-offset-gubat-900">
                <LogoMark decorative className="h-11 w-11" />
              </div>
              <div>
                <p className="eyebrow text-dahon">Pack list · Saved on this device</p>
                <h3 className="mt-1 text-3xl font-bold">Ready to roll?</h3>
              </div>
            </div>
            <p className="font-display text-5xl font-extrabold text-araw tabular-nums">{pct}%</p>
          </div>
          <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-puti/10">
            <div className="h-full rounded-full bg-dahon transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Straps and buckles hanging off the lid */}
        <div aria-hidden className="relative h-0">
          {['left-[16%]', 'right-[16%]'].map((pos) => (
            <div key={pos} className={`absolute -top-4 ${pos} flex w-9 flex-col items-center`}>
              <div className="h-12 w-9 bg-gubat-900" />
              <div className="-mt-1 h-7 w-12 rounded-md border-[3px] border-abo bg-gubat-900" />
            </div>
          ))}
        </div>

        {/* Zipper */}
        <div aria-hidden className="relative mx-6 mt-16 md:mx-14">
          <div className="border-t-2 border-dashed border-puti/25" />
          <div className="absolute -top-[13px] left-1/2 flex -translate-x-1/2 flex-col items-center">
            <div className="h-3 w-3 rounded-full border-2 border-abo" />
            <div className="-mt-0.5 h-6 w-3.5 rounded-b-full bg-araw" />
          </div>
        </div>

        {/* Main compartment */}
        <div className="relative grid gap-8 px-6 pt-8 pb-10 sm:grid-cols-2 md:px-14 lg:grid-cols-4">
          {Object.entries(checklist).map(([group, items]) => (
            <fieldset key={group}>
              <legend className="eyebrow text-dahon">{group}</legend>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" checked={done.includes(item)} onChange={() => toggle(item)} className="mt-1 h-4 w-4 shrink-0 accent-dahon" />
                      <span className={`transition ${done.includes(item) ? 'text-puti/40 line-through' : 'text-puti/85'}`}>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
        </div>

        {/* Front pocket */}
        <div className="relative mx-4 mb-4 rounded-[2.25rem] bg-gubat-700 px-6 py-6 md:mx-8 md:px-10">
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.8rem] border border-dashed border-puti/15" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <p className="text-puti/75">
              <span className="font-display font-semibold text-puti">Front pocket:</span> snacks, sunscreen, permits and a spare lighter.
            </p>
            <button type="button" onClick={() => setDone([])} className="btn-ghost !px-4 !py-2 text-puti">
              Unpack all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const accessNote = { '2WD': 'Any car', AWD: 'Gravel, some ruts', '4x4': 'Sand or deep ruts', 'Hike-in': 'On foot' } as const;

export default function Campsites() {
  const { data } = useAsync(() => api.campsites(), []);
  const tones = ['night', 'forest', 'dusk', 'dawn', 'forest'] as const;

  return (
    <>
      <PageHero scene="campsites" eyebrow="Campsites" tagalog="Kampo" icon="campsites" title={<>Where we sleep.</>}>
        Roadside pull-offs in the Adirondacks, a river bend in the Pine Barrens, sand under the tires on Long Island. These are the spots we keep
        coming back to.
      </PageHero>

      <section className="bg-surface py-12 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 md:grid-cols-2 md:px-8 lg:grid-cols-3">
          {(data ?? []).map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 100}>
              <article className="group card flex h-full flex-col overflow-hidden">
                <Photo name={`camp-${c.slug}`} src={c.image} alt={`${c.name} campsite`} tone={tones[i % tones.length]} className="aspect-[2/1] lg:aspect-[5/2]" caption={`${c.region}, ${c.state}`} />
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>{c.access} · {accessNote[c.access]}</Tag>
                    <Tag>{c.fee}</Tag>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-heading md:text-xl">{c.name}</h2>
                  <p className="mt-0.5 text-xs text-ink-muted md:text-sm">
                    {c.sites} · {c.season}
                  </p>
                  <p className="mt-2 text-sm leading-snug text-ink/85">{c.summary}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm">
                    {c.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dahon" aria-hidden />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 font-display text-sm font-semibold text-heading">
                    <a href={directionsUrl(c.coords)} target="_blank" rel="noreferrer" className="hover:underline">
                      Directions
                    </a>
                    {c.nearbyTrail && (
                      <Link to={`/trails/${c.nearbyTrail}`} className="hover:underline">
                        Nearby trail →
                      </Link>
                    )}
                    <span className="ml-auto text-xs font-normal text-ink-muted tabular-nums">{fmt.coords(c.coords)}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface-2 py-12 md:py-24">
        <div className="mx-auto max-w-7xl space-y-12 px-5 md:px-8">
          <SectionHead eyebrow="Before you go" tagalog="Handa ka na ba?" title="The pack list we actually use.">
            Check things off as you load the rig. Your progress is saved on this device, so you can start on Thursday and finish Friday night.
          </SectionHead>
          <Reveal>
            <Checklist />
          </Reveal>
        </div>
      </section>
    </>
  );
}
