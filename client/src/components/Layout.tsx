import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import type { SceneVariant } from '../three/HeaderScene';
import { useAutoReveal } from '../hooks/useAutoReveal';
import { useTheme } from '../lib/theme';
import { HeadlightsToggle } from './HeadlightsToggle';
import { LogoMark } from './SunMark';

const HeaderScene = lazy(() => import('../three/HeaderScene'));

export const IG_URL = 'https://www.instagram.com/nysakalamoverland/';

export const navItems = [
  { to: '/events', label: 'Events', icon: 'events', tl: 'Lakad' },
  { to: '/trails', label: 'Trails', icon: 'trails', tl: 'Daan' },
  { to: '/campsites', label: 'Campsites', icon: 'campsites', tl: 'Kampo' },
  { to: '/community', label: 'Community', icon: 'community', tl: 'Barkada' },
];

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Sakalam Overland home">
      <LogoMark decorative tone={light ? 'forest' : 'white'} className="h-10 w-10 transition-transform duration-700 ease-(--ease-trail) group-hover:rotate-[22.5deg]" />
      <span className={`font-display leading-none transition-colors ${light ? 'text-heading' : 'text-puti'}`}>
        <span className="block text-[1.05rem] font-extrabold tracking-[0.02em]">SAKALAM</span>
        <span className="block text-[0.58rem] font-semibold tracking-[0.5em] text-dahon">OVERLAND</span>
      </span>
    </Link>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  const { theme } = useTheme();
  const solid = scrolled || open;
  // Araw: the bar turns to light paper once it's solid, and it sits on the light home hero.
  // Gabi: everything under the bar is dark, so it stays dark.
  const light = theme === 'light' && (solid || pathname === '/');
  // While the menu is open the bar matches the panel, fully opaque.
  const barBg = open ? 'bg-surface-2' : light ? 'bg-surface-2/85 shadow-[0_1px_0_rgba(24,59,34,0.08)]' : 'bg-deep/85';
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-(--ease-trail) ${
          solid
            ? `${barBg} py-3 ${open ? '' : 'backdrop-blur-md'}`
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main">
          <Wordmark light={light} />
          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `group relative rounded-full px-4 py-2 font-display text-sm font-semibold transition ${
                      isActive ? 'text-dahon' : light ? 'text-heading/80 hover:text-heading' : 'text-puti/80 hover:text-puti'
                    }`
                  }
                >
                  {n.label}
                  <span className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-normal tracking-wide whitespace-nowrap text-abo italic opacity-0 transition group-hover:opacity-100">
                    {n.tl}
                  </span>
                </NavLink>
              </li>
            ))}
            <li className={`ml-2 ${light ? 'text-heading' : 'text-puti'}`}>
              <HeadlightsToggle />
            </li>
            <li className="ml-2">
              <Link to="/community#join" className="btn-primary !py-2.5">
                Join the crew
              </Link>
            </li>
          </ul>
          <div className={`flex items-center gap-2 md:hidden ${light ? 'text-heading' : 'text-puti'}`}>
            <HeadlightsToggle />
            <button
              type="button"
              className="relative h-10 w-10"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={`absolute left-2 h-0.5 w-6 bg-current transition ${open ? 'top-5 rotate-45' : 'top-3.5'}`} />
              <span className={`absolute left-2 h-0.5 w-6 bg-current transition ${open ? 'top-5 -rotate-45' : 'top-6'}`} />
            </button>
          </div>
        </nav>

      </header>
      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-x-0 top-[64px] bottom-0 z-40 overflow-y-auto bg-surface-2 px-5 pt-6 pb-10 shadow-[0_-1px_0_rgba(24,59,34,0.08)] transition duration-500 ease-(--ease-trail) md:hidden ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <ul className="space-y-2">
          {[{ to: '/', label: 'Home', icon: 'home', tl: 'Tahanan' }, ...navItems].map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} className="flex items-center gap-4 border-b border-line/10 py-4">
                <img src={`/icons/${n.icon}.png`} alt="" className="h-11 w-11" />
                <span className="font-display text-2xl font-bold text-heading">{n.label}</span>
                <span className="ml-auto text-sm text-ink-muted italic">{n.tl}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <Link to="/community#join" className="btn-primary mt-8 w-full justify-center">
          Join the crew
        </Link>
      </div>
    </>
  );
}

function Footer() {
  const link = 'text-sm text-puti/75 transition hover:text-puti';
  return (
    <footer className="relative overflow-hidden bg-deep text-puti">
      <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.025]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-12 md:gap-12 md:px-8 md:py-14">
        <div className="flex items-center gap-5 md:col-span-5 md:block">
          <img src="/brand/logo-color.png" alt="Sakalam Overland logo: three rigs below the Philippine sun and stars" className="w-24 shrink-0 md:w-36" loading="lazy" />
          <div>
            <p className="max-w-xs text-sm leading-relaxed text-puti/75 md:mt-5 md:text-base">
              Built in New York. Rooted in the Philippines. Tara na, let's go find a trail.
            </p>
            <p className="mt-2 font-baybayin text-2xl text-dahon md:mt-4" lang="tl" aria-label="Sakalam, written in Baybayin">
              ᜐᜃᜎᜋ᜔
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 md:col-span-7 md:gap-8">
          <div>
            <p className="eyebrow text-dahon">Explore</p>
            <ul className="mt-3 space-y-2">
              {navItems.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={link}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-dahon">Crew</p>
            <ul className="mt-3 space-y-2">
              <li><Link to="/community#join" className={link}>Join</Link></li>
              <li><Link to="/community#rigs" className={link}>Rigs</Link></li>
              <li><Link to="/community#merch" className={link}>Merch</Link></li>
              <li><Link to="/brand" className={link}>Brand</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-dahon">Follow</p>
            <a href={IG_URL} target="_blank" rel="noreferrer" className={`mt-3 inline-flex items-center gap-2 break-all ${link}`}>
              <InstagramIcon className="h-5 w-5 shrink-0" /> <span className="hidden sm:inline">@nysakalamoverland</span><span className="sm:hidden">Instagram</span>
            </a>
            <p className="mt-3 text-xs text-abo">New York · Pilipinas</p>
          </div>
        </div>
      </div>
      <div className="relative border-t border-puti/10">
        <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-abo md:px-8">
          © {new Date().getFullYear()} Sakalam Overland. Tread lightly and leave the trail better than you found it.
        </p>
      </div>
    </footer>
  );
}

export function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Layout() {
  const { pathname, hash } = useLocation();
  const pageKey = pathname.startsWith('/trails') ? '/trails' : pathname;
  const mainRef = useRef<HTMLElement>(null);
  useAutoReveal(mainRef, pageKey);
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded bg-araw px-4 py-2 text-itim focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Nav />
      {/* Re-key per page (trail detail swaps in place, so all /trails share a key). */}
      <div
        key={`line-${pageKey}`}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-dahon via-araw to-araw animate-[route-line_0.9s_var(--ease-trail)_forwards] motion-reduce:hidden"
      />
      <main id="main" ref={mainRef} key={pageKey} className="animate-[page-in_0.7s_var(--ease-trail)_backwards]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/** Every inner page header shares this box so they all sit at the same height. */
export const HEADER_BOX = 'relative flex min-h-[420px] flex-col justify-end overflow-hidden pt-28 pb-10 md:h-[440px] md:min-h-0 md:pb-12';

/** Banig texture plus the page's 3D relief tile, faded out behind the headline. */
export function HeaderBackdrop({ scene }: { scene: SceneVariant }) {
  return (
    <>
      <div className="banig pointer-events-none absolute inset-0 text-dahon opacity-[0.05]" />
      <Suspense fallback={null}>
        <HeaderScene
          variant={scene}
          className="pointer-events-none absolute -right-[35%] -bottom-[12%] h-[60%] w-[115%] opacity-20 md:top-0 md:right-0 md:bottom-0 md:h-auto md:w-[58%] md:opacity-100 md:[mask-image:linear-gradient(to_right,transparent,black_30%)]"
        />
      </Suspense>
    </>
  );
}

/** Dark page header shared by every inner page so the nav always sits on black. */
export function PageHero({
  eyebrow,
  title,
  tagalog,
  icon,
  scene,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  tagalog: string;
  icon: string;
  scene: SceneVariant;
  children?: React.ReactNode;
}) {
  return (
    <section className={`${HEADER_BOX} bg-deep text-puti`}>
      <HeaderBackdrop scene={scene} />
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="flex items-center gap-4 animate-rise">
          <img src={`/icons/${icon}.png`} alt="" className="h-10 w-10 rounded-full ring-1 ring-puti/25" />
          <p className="eyebrow text-dahon">
            {eyebrow} <span className="ml-2 normal-case tracking-normal text-abo italic">· {tagalog}</span>
          </p>
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.02] font-extrabold tracking-tight animate-rise [animation-delay:120ms] md:text-6xl">
          {title}
        </h1>
        {children && <div className="mt-4 max-w-xl text-base leading-relaxed font-light text-puti/70 animate-rise [animation-delay:240ms] md:text-lg">{children}</div>}
      </div>
    </section>
  );
}
