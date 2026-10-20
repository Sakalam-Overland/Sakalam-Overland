import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import type { SceneVariant } from '../three/HeaderScene';
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
      <span className={`font-display leading-none transition-colors ${light ? 'text-gubat' : 'text-puti'}`}>
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
  // The home hero is light; every other page opens on a dark header.
  const light = pathname === '/' && !scrolled && !open;
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-(--ease-trail) ${
        scrolled || open ? 'bg-itim/85 py-3 backdrop-blur-md' : 'bg-transparent py-5'
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
                    isActive ? 'text-dahon' : light ? 'text-gubat/80 hover:text-gubat' : 'text-puti/80 hover:text-puti'
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
          <li className="ml-3">
            <Link to="/community#join" className="btn-primary !py-2.5">
              Join the crew
            </Link>
          </li>
        </ul>
        <button
          type="button"
          className={`relative h-10 w-10 md:hidden ${light ? 'text-gubat' : 'text-puti'}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`absolute left-2 h-0.5 w-6 bg-current transition ${open ? 'top-5 rotate-45' : 'top-3.5'}`} />
          <span className={`absolute left-2 h-0.5 w-6 bg-current transition ${open ? 'top-5 -rotate-45' : 'top-6'}`} />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-[64px] bottom-0 bg-itim px-5 pt-8 transition duration-500 ease-(--ease-trail) md:hidden ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <ul className="space-y-2">
          {[{ to: '/', label: 'Home', icon: 'home', tl: 'Tahanan' }, ...navItems].map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} className="flex items-center gap-4 border-b border-puti/10 py-4">
                <img src={`/icons/${n.icon}.png`} alt="" className="h-11 w-11" />
                <span className="font-display text-2xl font-bold text-puti">{n.label}</span>
                <span className="ml-auto text-sm text-abo italic">{n.tl}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <Link to="/community#join" className="btn-primary mt-8 w-full justify-center">
          Join the crew
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-itim text-puti">
      <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.025]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <img src="/brand/logo-color.png" alt="Sakalam Overland logo: three rigs below the Philippine sun and stars" className="w-56" loading="lazy" />
          <p className="lead mt-6 max-w-sm text-puti/70">
            Built in New York. Rooted in the Philippines. Tara na, let's go find a trail.
          </p>
          <p className="mt-6 font-baybayin text-3xl text-dahon" lang="tl" aria-label="Sakalam, written in Baybayin">
            ᜐᜃᜎᜋ᜔
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
          <div>
            <p className="eyebrow text-dahon">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-puti/70 transition hover:text-puti">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-dahon">Crew</p>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/community#join" className="text-puti/70 transition hover:text-puti">Join</Link></li>
              <li><Link to="/community#rigs" className="text-puti/70 transition hover:text-puti">Rig showcase</Link></li>
              <li><Link to="/community#merch" className="text-puti/70 transition hover:text-puti">Merch</Link></li>
              <li><Link to="/brand" className="text-puti/70 transition hover:text-puti">Brand guide</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-dahon">Follow</p>
            <a href={IG_URL} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-puti/70 transition hover:text-puti">
              <InstagramIcon className="h-5 w-5" /> @nysakalamoverland
            </a>
            <p className="mt-4 text-sm text-abo">New York · Pilipinas</p>
          </div>
        </div>
      </div>
      <div className="relative border-t border-puti/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-abo md:flex-row md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Sakalam Overland. Tread lightly and leave the trail better than you found it.</p>
        </div>
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
      <main id="main">
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
    <section className={`${HEADER_BOX} bg-itim text-puti`}>
      <HeaderBackdrop scene={scene} />
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="flex items-center gap-4 animate-rise">
          <img src={`/icons/${icon}.png`} alt="" className="h-10 w-10" />
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
