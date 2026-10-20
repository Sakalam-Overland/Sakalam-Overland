import { useEffect, useId, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { DifficultyBadge, StatusBadge } from '../components/Badges';
import { EventCard } from '../components/EventCard';
import { IG_URL, InstagramIcon, navItems } from '../components/Layout';
import { SpareTire } from '../components/LicensePlate';
import { Photo } from '../components/Photo';
import { Reveal, SectionHead } from '../components/Reveal';
import { LogoMark, starPath } from '../components/SunMark';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { fmt } from '../lib/format';

/** Still topographic contour lines, like the margin of a trail map. */
function TopoLines({ className = '' }: { className?: string }) {
  const paths = useMemo(() => {
    const out: string[] = [];
    const peaks = [
      { cx: 980, cy: 260, rings: 11, seed: 1.3 },
      { cx: 160, cy: 700, rings: 9, seed: 4.1 },
    ];
    for (const p of peaks) {
      for (let r = 1; r <= p.rings; r++) {
        const pts: string[] = [];
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          // A few low harmonics give each ring an irregular, hand-surveyed wobble.
          const wobble = 1 + 0.14 * Math.sin(3 * a + p.seed + r * 0.35) + 0.08 * Math.sin(5 * a - p.seed * 2 + r * 0.2);
          const rad = r * 46 * wobble;
          pts.push(`${(p.cx + rad * Math.cos(a) * 1.35).toFixed(1)},${(p.cy + rad * Math.sin(a)).toFixed(1)}`);
        }
        out.push(`M${pts.join('L')}Z`);
      }
    }
    return out;
  }, []);
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={i % 5 === 4 ? 1.6 : 1} />
      ))}
    </svg>
  );
}

/** Layered ridgelines along the hero's base; the front ridge matches the next section. */
function Ridges() {
  const back = useRef<SVGGElement>(null);
  const mid = useRef<SVGGElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Gentle parallax: farther ridges drift slower than the page.
        const y = Math.min(window.scrollY, 900);
        back.current?.setAttribute('transform', `translate(0 ${y * 0.12})`);
        mid.current?.setAttribute('transform', `translate(0 ${y * 0.06})`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(90px,16vh,180px)] w-full" aria-hidden>
      <g ref={back}>
        <path d="M0,120 L120,78 L210,104 L330,52 L450,96 L560,70 L700,112 L820,60 L940,94 L1060,48 L1180,90 L1310,66 L1440,98 L1440,200 L0,200Z" fill="var(--color-dahon)" opacity="0.16" />
      </g>
      <g ref={mid}>
        <path d="M0,150 L140,112 L260,138 L380,96 L520,140 L650,108 L790,146 L930,104 L1080,138 L1210,110 L1340,140 L1440,124 L1440,200 L0,200Z" fill="var(--color-dahon)" opacity="0.28" />
      </g>
      <path d="M0,178 L180,150 L320,170 L470,142 L640,174 L800,150 L980,176 L1140,148 L1300,170 L1440,156 L1440,200 L0,200Z" fill="var(--color-puti)" />
    </svg>
  );
}

/** A slowly turning stamp, like a sticker on a rear window. */
function RouteStamp({ className = '' }: { className?: string }) {
  const id = useId();
  return (
    <div className={`grid place-items-center rounded-full bg-papel shadow-[0_10px_30px_-12px_rgba(24,59,34,0.45)] ring-1 ring-gubat/10 ${className}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-[spin_45s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs>
          <path id={`${id}ring`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        {/* textLength = the ring's circumference, so the phrase closes the loop exactly */}
        <text fill="var(--color-gubat)" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="14" textLength="460" lengthAdjust="spacing">
          <textPath href={`#${id}ring`} textLength="460" lengthAdjust="spacing">
            NEW YORK · PILIPINAS · SAMA-SAMA SA DAAN ·
          </textPath>
        </text>
      </svg>
      <LogoMark decorative tone="forest" className="h-[42%] w-[42%]" />
    </div>
  );
}

function NextRide({ className = '' }: { className?: string }) {
  const { data } = useAsync(() => api.events(), []);
  const next = data?.[0];
  if (!next) return null;
  const left = Math.max(0, next.capacity - next.rsvps);
  return (
    <Link
      to={`/events/${next.slug}`}
      className={`group flex items-center gap-4 rounded-2xl bg-puti p-4 pr-5 shadow-[0_24px_50px_-20px_rgba(24,59,34,0.55)] ring-1 ring-gubat/5 transition hover:-translate-y-0.5 ${className}`}
    >
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gubat text-center font-display leading-none text-puti">
        <div>
          <span className="block text-xl font-extrabold">{fmt.day(next.start)}</span>
          <span className="block text-[0.6rem] font-semibold tracking-widest text-dahon uppercase">{fmt.month(next.start)}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="eyebrow text-dahon">Next ride</p>
        <p className="truncate font-display font-bold text-gubat">{next.title}</p>
        <p className="text-xs text-abo-ink">{left === 0 ? 'Full · waitlist open' : `${left} spots left`}</p>
      </div>
      <span className="ml-auto text-gubat transition group-hover:translate-x-1" aria-hidden>
        →
      </span>
    </Link>
  );
}

function HeroStats() {
  const { data } = useAsync(() => api.events(), []);
  const stats = [
    ['2K+', 'on Instagram'],
    [data ? String(data.length) : '·', 'rides this season'],
    ['3', 'states we ride'],
  ];
  return (
    <dl className="mt-12 flex animate-rise gap-x-5 [animation-delay:400ms] sm:gap-x-8">
      {stats.map(([n, label], i) => (
        <div key={label} className={i ? 'border-l border-gubat/15 pl-5 sm:pl-8' : ''}>
          <dt className="sr-only">{label}</dt>
          <dd className="font-display text-2xl font-extrabold text-gubat tabular-nums sm:text-3xl">{n}</dd>
          <dd className="text-xs text-abo-ink sm:text-sm">{label}</dd>
        </div>
      ))}
    </dl>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-papel pt-28 md:pt-32">
      {/* Soft light: warm sun top right, green bottom left */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 -z-10 h-[42rem] w-[42rem] rounded-full bg-araw/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-dahon/20 blur-3xl" />
      <TopoLines className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-gubat opacity-[0.08]" />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 content-center items-center gap-14 px-5 lg:gap-20 pt-6 pb-[clamp(110px,18vh,200px)] md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow flex animate-rise items-center gap-3 text-gubat">
            <span className="h-px w-8 bg-gubat" />
            Filipino-founded · New York · Overland + Hike
          </p>
          <h1 className="mt-6 animate-rise font-display leading-[0.85] [animation-delay:100ms]">
            <span className="block text-[clamp(3.6rem,13vw,9rem)] font-extrabold tracking-[-0.04em] text-gubat lg:text-[8vw] xl:text-[9rem]">SAKALAM</span>
            <span className="mt-3 flex items-center gap-4 text-[clamp(1.3rem,4vw,2.6rem)] font-semibold tracking-[0.42em] text-dahon">
              OVERLAND
              <svg viewBox="0 0 40 12" className="h-3 w-10 shrink-0 text-araw" aria-hidden>
                <path d={starPath(6, 6, 5)} fill="currentColor" />
                <path d={starPath(20, 6, 5)} fill="currentColor" />
                <path d={starPath(34, 6, 5)} fill="currentColor" />
              </svg>
            </span>
          </h1>
          <p className="lead mt-8 max-w-lg animate-rise text-uling/80 [animation-delay:200ms]">
            <em className="font-normal text-gubat not-italic">Sama-sama sa daan,</em> together on the trail. A barkada of overlanders and
            hikers out of New York with Filipino roots and room in the convoy for you.
          </p>
          <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:300ms]">
            <Link to="/events" className="btn-dark">
              Upcoming rides <span aria-hidden>→</span>
            </Link>
            <Link to="/community#join" className="btn-ghost text-gubat">
              Join the crew
            </Link>
          </div>
          <HeroStats />
        </div>

        <div className="animate-rise [animation-delay:250ms] lg:col-span-5">
          <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:mr-0 lg:max-w-[440px] min-[1400px]:translate-x-10">
            {/* Snapshot tucked behind the tire */}
            <div className="absolute -top-6 right-0 w-[46%] rotate-6 rounded-md bg-puti p-2 pb-7 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)] sm:-right-8 lg:-right-2 min-[1400px]:-right-8">
              <Photo name="hero-snapshot" alt="Rigs lined up at a trailhead" tone="dawn" className="aspect-square rounded-sm" />
              <p className="absolute right-0 bottom-1.5 left-0 text-center font-display text-[0.6rem] font-semibold tracking-[0.2em] text-abo-ink uppercase">
                Rausch Creek, PA
              </p>
            </div>
            <SpareTire className="relative" />
            {/* Ground shadow */}
            <div aria-hidden className="mx-auto -mt-2 h-5 w-3/4 rounded-[100%] bg-itim/25 blur-md" />
            <RouteStamp className="absolute -top-4 -left-3 h-24 w-24 sm:h-28 sm:w-28" />
            <NextRide className="absolute -bottom-6 -left-4 w-[78%] animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none sm:-left-10" />
          </div>
        </div>
      </div>
      <Ridges />
    </section>
  );
}

function Meaning() {
  const word = 'MALAKAS'.split('');
  return (
    <section className="relative bg-puti py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <Reveal>
            <p className="eyebrow text-gubat">What's in a name</p>
            <p className="mt-6 font-display text-5xl font-bold tracking-tight text-gubat md:text-7xl">
              sa·ka·lam <span className="align-middle text-base font-normal tracking-normal text-abo-ink italic md:text-xl">adj.</span>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-2xl font-bold tracking-[0.25em] md:text-3xl">
              <span className="text-abo-ink/50">
                {word.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </span>
              <span className="h-px w-10 bg-araw" aria-hidden />
              <span className="text-gubat">
                {[...word].reverse().map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </span>
            </div>
            <p className="lead mt-8 max-w-xl text-uling/80">
              Filipino slang. Take <em className="font-normal not-italic text-gubat">malakas</em> (strong) and flip it. It means tough, solid,
              hard to stop, the way a good rig should be and the way a good crew is.
            </p>
            <p className="lead mt-5 max-w-xl text-uling/80">
              We started as a few Filipino-American friends with trucks and a group chat. Now we run group rides, campouts, sunrise hikes and a
              salu-salo or two. Everyone's welcome. Bring your rig, and bring a dish.
            </p>
          </Reveal>
        </div>
        <Reveal delay={150} className="md:col-span-5">
          <div className="relative mx-auto aspect-square max-w-sm">
            <div className="banig absolute inset-0 rounded-[2.5rem] text-gubat opacity-[0.08]" />
            <div className="absolute inset-6 grid place-items-center rounded-[2rem] bg-gubat text-center">
              <div>
                <p lang="tl" className="font-baybayin text-5xl text-puti md:text-6xl" aria-label="Sakalam in Baybayin script">
                  ᜐᜃᜎᜋ᜔
                </p>
                <p className="eyebrow mt-6 text-dahon">Baybayin · sa ka la m</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const pillarCopy: Record<string, string> = {
  '/events': 'Group rides, campouts and meetups, with spots capped so the convoy stays tight.',
  '/trails': 'Conditions, permits and gear lists from members who actually drove it last week.',
  '/campsites': 'Where we sleep: roadside, beach and trailhead sites we keep going back to.',
  '/community': 'Rigs, stories, merch and the people who show up with an extra shackle.',
};

function Pillars() {
  return (
    <section className="bg-papel py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead eyebrow="Start here" tagalog="Saan tayo?" title="Everything you need to get out there." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {navItems.map((n, i) => (
            <Reveal key={n.to} delay={i * 80}>
              <Link to={n.to} className="group flex h-full flex-col rounded-3xl bg-puti p-7 ring-1 ring-uling/5 transition duration-500 ease-(--ease-trail) hover:-translate-y-1 hover:bg-gubat">
                <img src={`/icons/${n.icon}.png`} alt="" className="h-14 w-14 transition group-hover:scale-110" />
                <p className="mt-8 text-sm text-abo-ink italic transition group-hover:text-dahon">{n.tl}</p>
                <h3 className="mt-1 text-2xl font-bold text-gubat transition group-hover:text-puti">{n.label}</h3>
                <p className="mt-3 text-uling/75 transition group-hover:text-puti/75">{pillarCopy[n.to]}</p>
                <span className="mt-auto pt-8 font-display text-sm font-semibold text-gubat transition group-hover:text-dahon">
                  Explore <span className="inline-block transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEvents() {
  const { data } = useAsync(() => api.events(), []);
  return (
    <section className="bg-puti py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead eyebrow="Upcoming events" tagalog="Mga lakad" title="Next on the calendar." />
          <Reveal>
            <Link to="/events" className="btn-ghost text-gubat">
              All events →
            </Link>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {(data ?? []).slice(0, 3).map((e, i) => (
            <Reveal key={e.slug} delay={i * 100} className="flex">
              <EventCard event={e} featured={i === 0} />
            </Reveal>
          ))}
          {!data && [0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-3xl bg-papel" />)}
        </div>
      </div>
    </section>
  );
}

function TrailBoard() {
  const { data } = useAsync(() => api.trails(), []);
  return (
    <section className="relative overflow-hidden bg-itim py-24 text-puti md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead dark eyebrow="Trail intel" tagalog="Balita sa daan" title="Conditions, from people who were just there.">
            No guessing about access. Every trail has a status, a permit note and the date a member last checked it.
          </SectionHead>
          <Reveal delay={150}>
            <Link to="/trails" className="btn-primary mt-8">
              Open the trail guide →
            </Link>
          </Reveal>
        </div>
        <Reveal delay={100} className="lg:col-span-8">
          <ul className="divide-y divide-puti/10 rounded-3xl bg-uling/60 ring-1 ring-puti/10">
            {(data ?? []).map((t) => (
              <li key={t.slug}>
                <Link to={`/trails/${t.slug}`} className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 px-6 py-5 transition hover:bg-puti/5 md:grid-cols-[1.6fr_1fr_auto_auto]">
                  <div>
                    <p className="font-display font-semibold">{t.name}</p>
                    <p className="text-sm text-abo">
                      {t.region}, {t.state} · {t.driveFromNYC} from NYC
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <DifficultyBadge value={t.difficulty} dark />
                  </div>
                  <div className="row-start-1 md:row-start-auto">
                    <StatusBadge value={t.status} dark />
                  </div>
                  <p className="hidden text-xs text-abo tabular-nums md:block">checked {t.lastVerified.slice(5).replace('-', '/')}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

const beliefs = [
  { tl: 'Bayanihan', en: 'We carry each other.', body: 'Getting stuck is part of it. Getting out is a group effort. Nobody gets left on the trail.' },
  { tl: 'Kapwa', en: 'Your people are my people.', body: "We don't gatekeep builds. A stock Subaru or a Rubicon on 40s, you're one of us." },
  { tl: 'Malasakit', en: 'Care for what you touch.', body: 'Stay on the trail, pack it out, and leave every campsite better than you found it.' },
  { tl: 'Salu-salo', en: 'Every trail ends at a table.', body: 'Kamayan at camp, potlucks in Queens. The food is half the reason we go.' },
];

function Beliefs() {
  return (
    <section className="relative overflow-hidden bg-gubat py-24 text-puti md:py-32">
      <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.04]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead dark eyebrow="#ourcorebelief" tagalog="Ang paniniwala namin" title="Four words we ride by." />
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-puti/10 md:grid-cols-2">
          {beliefs.map((b, i) => (
            <Reveal key={b.tl} delay={i * 80} className="bg-gubat p-8 md:p-12">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-sm font-semibold text-araw tabular-nums">0{i + 1}</span>
                <h3 className="text-4xl font-extrabold tracking-tight md:text-5xl">{b.tl}</h3>
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-dahon">{b.en}</p>
              <p className="lead mt-3 max-w-md text-puti/70">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const shots = [
  { name: 'trail-convoy', alt: 'Convoy of rigs on a forest road', tone: 'forest' as const, cls: 'md:col-span-2 md:row-span-2', cap: 'Pine Barrens' },
  { name: 'beach-camp', alt: 'Beach campsite with a deck chair at dusk', tone: 'dawn' as const, cls: '', cap: 'Smith Point' },
  { name: 'night-camp', alt: 'Campfire under the stars', tone: 'night' as const, cls: '', cap: 'Moose River' },
  { name: 'rock-crawl', alt: 'Jeep climbing a rock ledge', tone: 'dusk' as const, cls: 'md:col-span-2', cap: 'Rausch Creek' },
];

function Gallery() {
  return (
    <section className="bg-puti py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead eyebrow="From the trail" tagalog="Mula sa daan" title="Mud, sand, sunrise. Repeat." />
          <Reveal>
            <a href={IG_URL} target="_blank" rel="noreferrer" className="btn-ghost text-gubat">
              <InstagramIcon className="h-4 w-4" /> @nysakalamoverland
            </a>
          </Reveal>
        </div>
        <div className="mt-14 grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[260px]">
          {shots.map((s, i) => (
            <Reveal key={s.name} delay={i * 80} className={`group ${s.cls}`}>
              <Photo name={s.name} alt={s.alt} tone={s.tone} caption={s.cap} className="h-full rounded-3xl" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JoinBand() {
  return (
    <section className="relative overflow-hidden bg-dahon py-24 text-itim md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 md:flex-row md:items-end md:px-8">
        <Reveal>
          <p className="eyebrow">There's room in the convoy</p>
          <h2 className="mt-4 text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-extrabold tracking-[-0.04em]">Tara na.</h2>
          <p className="lead mt-4 max-w-md text-itim/75">That means "let's go." First ride? We'll pair you with a lead rig and teach you to air down.</p>
        </Reveal>
        <Reveal delay={150} className="flex flex-wrap gap-3">
          <Link to="/community#join" className="btn bg-itim text-puti hover:bg-gubat">
            Join the crew
          </Link>
          <Link to="/events" className="btn border border-itim/30 hover:border-itim">
            Find a ride
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Meaning />
      <Pillars />
      <UpcomingEvents />
      <TrailBoard />
      <Beliefs />
      <Gallery />
      <JoinBand />
    </>
  );
}
