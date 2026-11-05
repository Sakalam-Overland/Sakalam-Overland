import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { DifficultyBadge, StatusBadge } from '../components/Badges';
import { EventCard } from '../components/EventCard';
import { BoodleFight, dishes } from '../components/Food';
import { IG_URL, InstagramIcon, navItems } from '../components/Layout';
import { SpareTire } from '../components/LicensePlate';
import { Photo } from '../components/Photo';
import { Reveal, SectionHead } from '../components/Reveal';
import { LogoMark, starPath } from '../components/SunMark';
import { gallery, settings } from '@shared/data';
import { useAsync } from '../hooks/useAsync';
import { usePauseOffscreen } from '../hooks/usePauseOffscreen';
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
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(56px,10svh,180px)] w-full" aria-hidden>
      <g ref={back}>
        <path d="M0,120 L120,78 L210,104 L330,52 L450,96 L560,70 L700,112 L820,60 L940,94 L1060,48 L1180,90 L1310,66 L1440,98 L1440,200 L0,200Z" fill="var(--color-dahon)" opacity="0.16" />
      </g>
      <g ref={mid}>
        <path d="M0,150 L140,112 L260,138 L380,96 L520,140 L650,108 L790,146 L930,104 L1080,138 L1210,110 L1340,140 L1440,124 L1440,200 L0,200Z" fill="var(--color-dahon)" opacity="0.28" />
      </g>
      <path d="M0,178 L180,150 L320,170 L470,142 L640,174 L800,150 L980,176 L1140,148 L1300,170 L1440,156 L1440,200 L0,200Z" fill="var(--color-surface)" />
    </svg>
  );
}

/** A slowly turning stamp, like a sticker on a rear window. */
function RouteStamp({ className = '' }: { className?: string }) {
  const id = useId();
  return (
    <div className={`grid place-items-center rounded-full bg-surface-2 shadow-[0_10px_30px_-12px_rgba(24,59,34,0.45)] ring-1 ring-line/10 ${className}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-[spin_45s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs>
          <path id={`${id}ring`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        {/* textLength = the ring's circumference, so the phrase closes the loop exactly */}
        <text fill="var(--color-heading)" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="14" textLength="460" lengthAdjust="spacing">
          <textPath href={`#${id}ring`} textLength="460" lengthAdjust="spacing">
            NEW YORK · PILIPINAS · SAMA-SAMA SA DAAN ·
          </textPath>
        </text>
      </svg>
      <LogoMark decorative tone="forest" className="h-[42%] w-[42%] dark:brightness-0 dark:invert" />
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
      className={`group flex items-center gap-4 rounded-2xl bg-surface p-4 pr-5 shadow-[0_24px_50px_-20px_rgba(24,59,34,0.55)] ring-1 ring-line/5 transition hover:-translate-y-0.5 ${className}`}
    >
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gubat text-center font-display leading-none text-puti">
        <div>
          <span className="block text-xl font-extrabold">{fmt.day(next.start)}</span>
          <span className="block text-[0.6rem] font-semibold tracking-widest text-dahon uppercase">{fmt.month(next.start)}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="eyebrow text-dahon">Next ride</p>
        <p className="truncate font-display font-bold text-heading">{next.title}</p>
        <p className="text-xs text-ink-muted">{left === 0 ? 'Full · waitlist open' : `${left} spots left`}</p>
      </div>
      <span className="ml-auto text-heading transition group-hover:translate-x-1" aria-hidden>
        →
      </span>
    </Link>
  );
}

function HeroStats() {
  const { data } = useAsync(() => api.events(), []);
  const stats = [
    [settings.instagramFollowers, 'on Instagram'],
    [data ? String(data.length) : '·', 'rides this season'],
    [settings.statesRidden, 'states we ride'],
  ];
  return (
    <dl className="mt-12 hidden animate-rise gap-x-5 [animation-delay:400ms] sm:flex sm:gap-x-8">
      {stats.map(([n, label], i) => (
        <div key={label} className={i ? 'border-l border-heading/15 pl-5 sm:pl-8' : ''}>
          <dt className="sr-only">{label}</dt>
          <dd className="font-display text-2xl font-extrabold text-heading tabular-nums sm:text-3xl">{n}</dd>
          <dd className="text-xs text-ink-muted sm:text-sm">{label}</dd>
        </div>
      ))}
    </dl>
  );
}

function Hero() {
  const heroRef = usePauseOffscreen<HTMLElement>();
  return (
    <section ref={heroRef} data-no-reveal className="relative isolate flex h-[100svh] min-h-[540px] flex-col overflow-hidden bg-surface-2 pt-20 short:pt-[60px] md:h-auto md:min-h-[100svh] md:pt-32">
      {/* Soft light: warm sun top right, green bottom left */}
      {/* Radial gradients instead of blur filters: same glow, far cheaper to paint on phones */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_32rem_at_100%_0%,rgba(246,184,26,0.2),transparent_70%),radial-gradient(34rem_28rem_at_0%_100%,rgba(97,171,115,0.2),transparent_70%)] dark:bg-[radial-gradient(40rem_32rem_at_100%_0%,rgba(255,138,60,0.09),transparent_70%),radial-gradient(34rem_28rem_at_0%_100%,rgba(97,171,115,0.09),transparent_70%)]" />
      <TopoLines className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-heading opacity-[0.08]" />

      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-[max(16px,2.5svh)] px-5 pt-[2svh] pb-[clamp(56px,10svh,200px)] md:grid md:content-center md:items-center md:gap-14 md:px-8 md:pt-6 lg:grid-cols-12 lg:gap-20">
        <div className="shrink-0 lg:col-span-7">
          <p className="eyebrow flex animate-rise items-center gap-3 text-heading short:hidden">
            <span className="h-px w-8 bg-heading" />
            Filipino-founded · New York · Overland + Hike
          </p>
          <h1 className="mt-[2svh] animate-rise font-display leading-[0.85] [animation-delay:100ms] md:mt-6">
            <span className="block text-[min(15vw,8svh)] font-extrabold md:text-[clamp(3.6rem,13vw,9rem)] tracking-[-0.04em] text-heading lg:text-[8vw] xl:text-[9rem]">SAKALAM</span>
            <span className="mt-2 flex items-center gap-4 text-[min(5.5vw,3svh)] md:mt-3 md:text-[clamp(1.3rem,4vw,2.6rem)] font-semibold tracking-[0.42em] text-dahon">
              OVERLAND
              <svg viewBox="0 0 40 12" className="h-3 w-10 shrink-0 text-araw" aria-hidden>
                <path d={starPath(6, 6, 5)} fill="currentColor" />
                <path d={starPath(20, 6, 5)} fill="currentColor" />
                <path d={starPath(34, 6, 5)} fill="currentColor" />
              </svg>
            </span>
          </h1>
          <p className="lead mt-[2.2svh] max-w-lg animate-rise text-[0.95rem] leading-relaxed text-ink/80 [animation-delay:200ms] md:mt-8 md:text-xl">
            <em className="font-normal text-heading not-italic">Sama-sama sa daan,</em> together on the trail. A barkada of overlanders and
            hikers out of New York<span className="hidden sm:inline"> with Filipino roots and room in the convoy for you</span>.
          </p>
          <div className="mt-[2.6svh] flex animate-rise flex-wrap gap-2.5 [animation-delay:300ms] md:mt-9 md:gap-3 [&>a]:max-sm:px-5 [&>a]:max-sm:py-2.5">
            <Link
              to="/events"
              className="btn bg-araw text-gubat shadow-[0_10px_22px_-10px_rgba(246,184,26,0.85)] hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-10px_rgba(246,184,26,1)] active:translate-y-0 focus-visible:outline-heading"
            >
              Find a ride <span aria-hidden className="inline-block animate-[nudge_1.6s_ease-in-out_infinite] motion-reduce:animate-none">→</span>
            </Link>
            <Link to="/community#join" className="btn-ghost text-heading">
              Join the crew
            </Link>
          </div>
          <HeroStats />
        </div>

        {/* Phones: the media fills whatever height the text leaves and sizes itself from that, so it never rides up into the text. */}
        <div className="flex min-h-0 flex-1 animate-rise items-center justify-center pt-6 [container-type:size] [animation-delay:250ms] md:block md:flex-none md:pt-0 md:[container-type:normal] lg:col-span-5">
          <div className="relative mx-auto w-[min(72vw,calc(100cqh-1.75rem))] md:w-full md:max-w-[400px] lg:mr-0 lg:max-w-[440px] min-[1400px]:translate-x-10">
            {/* Snapshot tucked behind the tire */}
            <div className="absolute -top-6 right-0 w-[46%] rotate-6 rounded-md bg-white p-2 pb-7 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)] sm:-right-8 lg:-right-2 min-[1400px]:-right-8">
              <Photo name="hero-snapshot" src={settings.heroPhoto} alt="Rigs lined up at a trailhead" tone="dawn" className="aspect-square rounded-sm" />
              <p className="absolute right-0 bottom-1.5 left-0 text-center font-display text-[0.6rem] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                {settings.heroPhotoCaption}
              </p>
            </div>
            {/* Night mode: warm backlight and a rim highlight so the dark tire separates from the dark page */}
            <div aria-hidden className="pointer-events-none absolute inset-[-12%] hidden rounded-full bg-[radial-gradient(circle,rgba(246,184,26,0.28)_0%,rgba(97,171,115,0.14)_45%,transparent_70%)] dark:block" />
            <SpareTire className="relative rounded-full dark:shadow-[0_0_0_2px_rgba(241,239,230,0.55),0_0_40px_6px_rgba(246,184,26,0.18)]" />
            {/* Ground shadow */}
            <div aria-hidden className="mx-auto -mt-2 h-5 w-3/4 rounded-[100%] bg-itim/25 blur-md" />
            <RouteStamp className="absolute -top-3 -left-6 aspect-square w-[38%] sm:-top-4 sm:-left-3 sm:w-28" />
            <NextRide className="absolute -bottom-6 -left-10 hidden w-[78%] animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none sm:flex" />
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
    <section className="relative flex min-h-[100svh] items-center bg-surface py-12 md:block md:min-h-0 md:py-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-5 md:grid-cols-12 md:gap-16 md:px-8">
        <div className="md:col-span-7">
          <Reveal>
            <p className="eyebrow text-heading">What's in a name</p>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight text-heading md:mt-6 md:text-7xl">
              sa·ka·lam <span className="align-middle text-base font-normal tracking-normal text-ink-muted italic md:text-xl">adj.</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-xl font-bold tracking-[0.25em] md:mt-6 md:text-3xl">
              <span className="text-ink-muted/50">
                {word.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </span>
              <span className="h-px w-10 bg-araw" aria-hidden />
              <span className="text-heading">
                {[...word].reverse().map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </span>
            </div>
            <p className="lead mt-4 max-w-xl text-ink/80 md:mt-8">
              Filipino slang. Take <em className="font-normal not-italic text-heading">malakas</em> (strong) and flip it. It means tough, solid,
              hard to stop, the way a good rig should be and the way a good crew is.
            </p>
            <p className="lead mt-3 max-w-xl text-ink/80 md:mt-5">
              We started as a few Filipino-American friends with trucks and a group chat. Now we run group rides, campouts, sunrise hikes and a
              salu-salo or two. Everyone's welcome. Bring your rig, and bring a dish.
            </p>
          </Reveal>
        </div>
        <Reveal delay={150} className="md:col-span-5">
          <div className="relative mx-auto max-w-sm md:aspect-square">
            <div className="banig absolute inset-0 hidden rounded-[2.5rem] text-heading opacity-[0.08] md:block" />
            <div className="flex items-center justify-center gap-5 rounded-[1.5rem] bg-gubat px-6 py-4 text-center md:absolute md:inset-6 md:grid md:place-items-center md:rounded-[2rem] md:p-0">
              <div className="flex items-center gap-5 md:block">
                <p lang="tl" className="font-baybayin text-4xl text-puti md:text-6xl" aria-label="Sakalam in Baybayin script">
                  ᜐᜃᜎᜋ᜔
                </p>
                <p className="eyebrow text-dahon md:mt-6">Baybayin · sa ka la m</p>
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
    <section className="flex min-h-[100svh] items-center bg-surface-2 py-12 md:block md:min-h-0 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <SectionHead eyebrow="Start here" tagalog="Saan tayo?" title="Everything you need to get out there." />
        <div className="mt-5 grid grid-cols-1 gap-2.5 md:mt-8 md:grid-cols-2 md:gap-4 lg:grid-cols-4 [&>*]:min-w-0">
          {navItems.map((n, i) => (
            <Reveal key={n.to} delay={i * 80}>
              <Link
                to={n.to}
                className="group flex h-full items-center gap-3.5 rounded-2xl bg-surface p-3.5 ring-1 ring-line/5 transition duration-500 ease-(--ease-trail) hover:bg-gubat md:flex-col md:items-start md:gap-0 md:rounded-3xl md:p-5 md:hover:-translate-y-1"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-full">
                  <img src={`/icons/${n.icon}.png`} alt="" className="h-10 w-10 shrink-0 transition group-hover:scale-110 md:h-11 md:w-11" />
                  <div className="hidden md:block">
                    <p className="text-sm text-ink-muted italic transition group-hover:text-dahon">{n.tl}</p>
                    <h3 className="text-xl font-bold text-heading transition group-hover:text-puti">{n.label}</h3>
                  </div>
                </div>
                {/* Phones: title and a one-line blurb beside the icon */}
                <div className="min-w-0 flex-1 md:hidden">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-base font-bold text-heading transition group-hover:text-puti">{n.label}</span>
                    <span className="text-xs text-ink-muted italic transition group-hover:text-dahon">{n.tl}</span>
                  </p>
                  <p className="truncate text-xs text-ink/75 transition group-hover:text-puti/75">{pillarCopy[n.to]}</p>
                </div>
                <span className="shrink-0 text-heading transition group-hover:translate-x-1 group-hover:text-dahon md:hidden" aria-hidden>
                  →
                </span>
                <p className="mt-3 hidden text-sm leading-snug text-ink/75 transition group-hover:text-puti/75 md:block">{pillarCopy[n.to]}</p>
                <span className="mt-auto hidden pt-4 font-display text-sm font-semibold text-heading transition group-hover:text-dahon md:block">
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
  const list = (data ?? []).slice(0, 3);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  // Track which card is in view so the dots (phones only) show position in the row.
  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 12 : el.clientWidth;
    setActive(Math.min(list.length - 1, Math.round(el.scrollLeft / step)));
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };
  const go = (i: number) => {
    const el = rail.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
  };

  return (
    <section className="flex min-h-[100svh] items-center bg-surface py-12 md:block md:min-h-0 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end md:gap-6">
          <SectionHead eyebrow="Upcoming events" tagalog="Mga lakad" title="Next on the calendar." />
          <Reveal>
            <Link to="/events" className="btn-ghost text-heading">
              All events →
            </Link>
          </Reveal>
        </div>
        <Reveal className="relative">
          <div
            ref={rail}
            onScroll={onScroll}
            role="region"
            aria-label="Upcoming events, swipe for more"
            className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pt-2 pb-3 md:mx-0 md:mt-8 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0"
          >
            {list.map((e, i) => (
              <div key={e.slug} data-no-reveal className="flex w-[74%] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none">
                <EventCard event={e} featured={i === 0} />
              </div>
            ))}
            {!data && [0, 1, 2].map((i) => <div key={i} className="h-56 w-[74%] shrink-0 animate-pulse rounded-2xl bg-surface-2 md:w-auto" />)}
            {/* Trailing room so the last card can snap clear of the edge */}
            <div aria-hidden className="w-2 shrink-0 md:hidden" />
          </div>
          {/* Fade on the right edge says "there's more this way" until the end is reached */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 -right-5 w-14 bg-gradient-to-l from-surface to-transparent transition-opacity duration-300 md:hidden ${atEnd ? 'opacity-0' : 'opacity-100'}`}
          />
        </Reveal>
        {list.length > 1 && (
          <div className="mt-3 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-1" role="tablist" aria-label="Choose an event">
              {list.map((e, i) => (
                <button
                  key={e.slug}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  aria-label={`Show ${e.title}`}
                  onClick={() => go(i)}
                  className="grid h-8 min-w-8 place-items-center"
                >
                  <span className={`block h-2 rounded-full transition-all duration-300 ${active === i ? 'w-6 bg-heading' : 'w-2 bg-line/25'}`} />
                </button>
              ))}
            </div>
            <p
              aria-hidden
              className={`flex items-center gap-1.5 font-display text-xs font-semibold text-ink-muted transition-opacity duration-300 ${atEnd ? 'opacity-0' : 'opacity-100'}`}
            >
              Swipe for more
              <span className="inline-block animate-[nudge_1.6s_ease-in-out_infinite] motion-reduce:animate-none">→</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TrailBoard() {
  const { data } = useAsync(() => api.trails(), []);
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-deep py-12 text-puti md:block md:min-h-0 md:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 md:gap-14 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead dark eyebrow="Trail intel" tagalog="Balita sa daan" title="Conditions, from people who were just there." className="[&_.lead]:short:hidden">
            No guessing about access. Every trail has a status, a permit note and the date a member last checked it.
          </SectionHead>
          <Reveal delay={150}>
            <Link to="/trails" className="btn-primary mt-4 max-sm:hidden md:mt-8">
              Open the trail guide →
            </Link>
          </Reveal>
        </div>
        <Reveal delay={100} className="lg:col-span-8">
          <ul className="divide-y divide-puti/10 rounded-3xl bg-puti/5 ring-1 ring-puti/10">
            {(data ?? []).map((t) => (
              <li key={t.slug}>
                <Link to={`/trails/${t.slug}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 short:py-2 transition md:gap-x-6 md:gap-y-2 md:px-6 md:py-5 hover:bg-puti/5 md:grid-cols-[1.6fr_1fr_auto_auto]">
                  <div className="col-start-1 row-start-1 min-w-0">
                    <p className="font-display text-sm font-semibold md:text-base">{t.name}</p>
                    <p className="text-xs text-abo md:text-sm">
                      {t.region}, {t.state} · {t.driveFromNYC} from NYC
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <DifficultyBadge value={t.difficulty} dark />
                  </div>
                  <div className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-auto">
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
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-gubat py-12 text-puti md:block md:min-h-0 md:py-20 dark:bg-[#0f2717]">
      <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.04]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <SectionHead dark eyebrow="#ourcorebelief" tagalog="Ang paniniwala namin" title="Four words we ride by." />
        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-4 lg:grid-cols-4">
          {beliefs.map((b, i) => (
            <Reveal key={b.tl} delay={i * 80} className="card-raised p-4 md:p-5">
              <span className="font-display text-xs font-semibold text-araw tabular-nums">0{i + 1}</span>
              <h3 className="mt-1 text-xl font-extrabold tracking-tight md:text-2xl">{b.tl}</h3>
              <p className="mt-1.5 font-display text-xs font-semibold text-dahon-300 md:mt-2 md:text-base">{b.en}</p>
              <p className="mt-1.5 text-xs leading-snug text-puti/80 md:mt-2 md:text-sm md:leading-relaxed">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SaluSalo() {
  // Sized to fit one screen on a laptop: copy beside the spread, dishes in one compact band.
  return (
    <section className="flex min-h-[100svh] flex-col justify-center bg-surface-2 py-12 lg:py-12">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-5 md:gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow flex items-center gap-3 text-heading">
              <span className="h-px w-8 bg-heading" />
              Salu-salo <span className="normal-case tracking-normal text-ink-muted italic">· Kain tayo</span>
            </p>
            <h2 className="mt-3 text-[1.85rem] leading-[1.05] font-bold tracking-tight text-heading sm:text-4xl md:mt-4 md:text-5xl">Every trail ends at a table.</h2>
            <p className="mt-3 text-sm sm:text-base md:mt-4 leading-relaxed text-ink/80 md:text-lg">
              The food is half the reason we go. After every big run we lay banana leaves down the tailgates for a boodle fight: rice down the
              middle, everyone's ulam around it, no plates, no forks. Kamayan style.
            </p>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <figure className="overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(24,59,34,0.6)]">
              <BoodleFight className="block h-auto w-full" />
            </figure>
          </Reveal>
        </div>
        <ul className="mt-5 grid grid-cols-3 gap-2 md:mt-8 md:gap-3 xl:grid-cols-6">
          {dishes.map(({ name, Art, note }, i) => (
            <Reveal as="li" key={name} delay={i * 60}>
              <div className="group flex h-full flex-col items-center rounded-2xl bg-surface p-2.5 text-center md:rounded-3xl md:p-4 ring-1 ring-line/5 transition duration-500 ease-(--ease-trail) hover:-translate-y-1">
                <svg viewBox="0 0 120 120" className="h-12 w-12 shrink-0 transition duration-700 md:h-16 md:w-16 ease-(--ease-trail) group-hover:rotate-12" aria-hidden>
                  <Art />
                </svg>
                <p className="mt-1.5 font-display text-sm font-bold text-heading md:mt-2 md:text-base">{name}</p>
                <p className="mt-1 hidden text-xs leading-snug text-ink-muted sm:block">{note}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Gallery() {
  // First photo is the big one; the grid holds four.
  const layout = ['col-span-2 md:row-span-2', '', '', 'col-span-2'];
  const tones = ['forest', 'dawn', 'night', 'dusk'] as const;
  return (
    <section className="flex min-h-[100svh] items-center bg-surface py-12 md:block md:min-h-0 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end md:gap-6">
          <SectionHead eyebrow="From the trail" tagalog="Mula sa daan" title="Mud, sand, sunrise. Repeat." />
          <Reveal>
            <a href={IG_URL} target="_blank" rel="noreferrer" className="btn-ghost text-heading">
              <InstagramIcon className="h-4 w-4" /> @nysakalamoverland
            </a>
          </Reveal>
        </div>
        <div className="mt-6 grid auto-rows-[min(19svh,150px)] short:auto-rows-[16svh] grid-cols-2 gap-3 md:mt-8 md:auto-rows-[190px] md:grid-cols-4 md:gap-4">
          {gallery.slice(0, 4).map((s, i) => (
            <Reveal key={`${s.caption}-${i}`} delay={i * 80} className={`group ${layout[i % layout.length]}`}>
              <Photo name={`gallery-${i}`} src={s.image} alt={s.alt} tone={tones[i % tones.length]} caption={s.caption} className="h-full rounded-3xl" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Banderitas: the triangle bunting strung up for every barrio fiesta. */
function Banderitas({ className = '' }: { className?: string }) {
  const colors = ['var(--color-araw)', 'var(--color-puti)', 'var(--color-dahon)', '#e8553e', 'var(--color-puti)', 'var(--color-araw)', '#2f6fb3'];
  const flags = 34;
  const width = 1440;
  const step = width / flags;
  // The string sags between three posts.
  const sag = (x: number) => 14 + Math.abs(Math.sin((x / width) * Math.PI * 3)) * 22;
  return (
    <svg viewBox={`0 0 ${width} 80`} preserveAspectRatio="xMidYMin slice" className={className} aria-hidden>
      <path
        d={Array.from({ length: 121 }, (_, i) => `${i ? 'L' : 'M'}${(i / 120) * width},${sag((i / 120) * width).toFixed(1)}`).join('')}
        fill="none"
        stroke="var(--color-puti)"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      {Array.from({ length: flags }, (_, i) => {
        const x0 = i * step + 3;
        const x1 = (i + 1) * step - 3;
        const xm = (x0 + x1) / 2;
        return (
          <path
            key={i}
            d={`M${x0},${sag(x0)} L${x1},${sag(x1)} L${xm},${sag(xm) + 30}Z`}
            fill={colors[i % colors.length]}
            opacity={0.92}
            className="origin-top animate-[sway_4s_ease-in-out_infinite] motion-reduce:animate-none"
            style={{ animationDelay: `${(i % 5) * -0.7}s`, transformBox: 'fill-box' }}
          />
        );
      })}
    </svg>
  );
}

/** A jeepney route signboard: painted letters, pinstripes, and where the ride is headed. */
function RouteSign() {
  return (
    <div className="relative w-full max-w-md rotate-[-2deg] rounded-[1.75rem] bg-[#f6efdc] p-2 text-gubat shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] dark:bg-[#ece3c9]">
      {/* Chrome hooks the sign hangs from */}
      {['left-10', 'right-10'].map((pos) => (
        <span key={pos} aria-hidden className={`absolute -top-5 ${pos} h-6 w-1.5 rounded-full bg-gradient-to-b from-[#e7eae6] to-[#8b918d]`} />
      ))}
      <div className="rounded-[1.4rem] border-[3px] border-araw p-1">
        <div className="rounded-[1.1rem] border border-dashed border-[#e8553e]/70 px-4 py-5 text-center sm:px-6">
          <p className="font-display text-[0.65rem] font-bold tracking-[0.4em] text-[#e8553e]">BIYAHENG</p>
          <p className="mt-1 flex items-center justify-center gap-2 font-display text-[clamp(1.4rem,6.5vw,2.25rem)] leading-none font-extrabold tracking-tight whitespace-nowrap sm:gap-3">
            NYC <span className="text-araw">⇄</span> KAHIT SAAN
          </p>
          <div className="mx-auto my-3 flex items-center justify-center gap-2" aria-hidden>
            <span className="h-px w-10 bg-gubat/30" />
            <svg viewBox="0 0 40 12" className="h-3 w-10 text-araw">
              <path d={starPath(6, 6, 5)} fill="currentColor" />
              <path d={starPath(20, 6, 5)} fill="currentColor" />
              <path d={starPath(34, 6, 5)} fill="currentColor" />
            </svg>
            <span className="h-px w-10 bg-gubat/30" />
          </div>
          <p className="font-display text-sm font-bold">Sakay na! · Every weekend</p>
          <p className="mt-0.5 text-xs text-gubat/70 italic">Kahit saan means "anywhere." Hop on.</p>
        </div>
      </div>
    </div>
  );
}

const firstRide = [
  { title: 'Sign up', body: 'Join the list or RSVP to a ride. Free, takes 30 seconds, and you get the group chat invite.' },
  { title: 'Get paired', body: 'First-timers ride behind a lead rig. We check your tires, recovery points and radio at the meetup.' },
  { title: 'Hit the trail', body: 'We air down together and take it slow. Getting stuck is part of it, and somebody always has a strap.' },
  { title: 'Kain tayo', body: 'Every run ends with food. Bring a dish if you can; there is always enough rice.' },
];

export function JoinBand() {
  const bandRef = usePauseOffscreen<HTMLElement>();
  return (
    <section ref={bandRef} className="banana-leaf relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-20 pb-12 text-puti md:pt-28 md:pb-16">
      {/* The flag's sun rising behind the band */}
      <svg viewBox="-100 -100 200 200" className="pointer-events-none absolute -right-40 -bottom-56 -z-10 h-[38rem] w-[38rem] text-araw opacity-[0.12] md:-right-20" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45})`} fill="currentColor">
            <path d="M-6,-34 L-8,-96 L8,-96 L6,-34Z" />
            <path d="M-14,-35 L-22,-86 L-17,-86 L-10,-35Z" />
            <path d="M14,-35 L22,-86 L17,-86 L10,-35Z" />
          </g>
        ))}
        <circle r="30" fill="currentColor" />
      </svg>
      <Banderitas className="absolute inset-x-0 top-0 h-16 w-full md:h-20" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 md:gap-14 md:px-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow text-araw">
            May puwesto pa <span className="ml-1 normal-case tracking-normal text-puti/60 italic">· there's room in the convoy</span>
          </p>
          <h2 className="mt-5 font-display text-[clamp(4rem,12vw,9.5rem)] leading-[0.85] font-extrabold tracking-[-0.04em]">
            Tara na<span className="text-araw">.</span>
          </h2>
          <p className="lead mt-6 max-w-lg text-puti/75">
            That means <em className="font-normal text-puti not-italic">"let's go."</em> First ride? We'll pair you with a lead rig, teach you to
            air down, and save you a plate at the salu-salo.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/community#join" className="btn bg-araw text-itim hover:bg-puti">
              Join the crew <span aria-hidden>→</span>
            </Link>
            <Link to="/events" className="btn-ghost text-puti">
              Find a ride
            </Link>
          </div>
        </Reveal>
        <Reveal delay={150} className="flex justify-center lg:col-span-5 lg:justify-end">
          <RouteSign />
        </Reveal>
      </div>

      {/* What a first ride looks like, so "join" feels concrete */}
      <div className="mx-auto mt-8 w-full max-w-7xl px-5 short:hidden md:mt-14 md:px-8">
        <p className="eyebrow text-araw">Unang sakay · your first ride</p>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 md:mt-4 lg:grid-cols-4">
          {firstRide.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 80} className="rounded-2xl bg-gubat-900/45 p-3 ring-1 ring-puti/15 backdrop-blur-[2px] sm:p-4 md:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-araw font-display text-xs font-bold text-itim sm:h-8 sm:w-8 sm:text-sm">{i + 1}</span>
                <h3 className="font-display text-sm font-bold sm:text-base md:text-lg">{step.title}</h3>
              </div>
              <p className="mt-2 hidden text-sm leading-relaxed text-puti/80 sm:block">{step.body}</p>
            </Reveal>
          ))}
        </ol>
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
      <SaluSalo />
      <Gallery />
      <JoinBand />
    </>
  );
}
