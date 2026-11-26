import { useEffect, useState } from 'react';

const KEY = 'sakalam:splash-seen';
const SHOW_MS = 2700; // when the curtain starts to lift
const EXIT_MS = 600; // how long the lift takes

/** Show once per browser tab session, and never for visitors who prefer reduced motion. */
function shouldShow() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage blocked: still show it, just not remembered */
  }
  return true;
}
// Decided once per page load (StrictMode calls state initializers twice, so not in there).
let decided: boolean | undefined;
const showOnce = () => (decided ??= shouldShow());

const ray = 'M100 104 L95.5 74 L100 46 L104.5 74Z';
const thin = 'M100 104 L98.6 80 L100 64 L101.4 80Z';
const star = 'M12 0 l3.7 7.6 8.3 1.2 -6 5.8 1.4 8.3 -7.4-3.9 -7.4 3.9 1.4-8.3 -6-5.8 8.3-1.2z';

/** The Filipino sun rising over the mountains inside the ring, with the three stars on top. */
function Emblem() {
  return (
    <svg viewBox="-6 -10 212 216" className="splash-emblem h-40 w-40 md:h-48 md:w-48" aria-hidden>
      <defs>
        <clipPath id="splash-clip">
          <circle cx="100" cy="100" r="88" />
        </clipPath>
        <radialGradient id="splash-halo">
          <stop offset="0" stopColor="#ffd25e" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffd25e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="splash-core" cx=".4" cy=".38" r=".7">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset=".55" stopColor="#ffd25e" />
          <stop offset="1" stopColor="#f6b81a" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="88" fill="#183b22" />
      <circle className="splash-ring" cx="100" cy="100" r="95" fill="none" stroke="#f6b81a" strokeWidth="3" />
      <g clipPath="url(#splash-clip)">
        <g className="splash-sun">
          <circle className="splash-halo" cx="100" cy="104" r="66" fill="url(#splash-halo)" />
          <g className="splash-rays-thin" fill="#ffe08a">
            {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a) => (
              <path key={a} d={thin} transform={`rotate(${a} 100 104)`} />
            ))}
          </g>
          <g className="splash-rays" fill="#f6b81a">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <g key={a} transform={`rotate(${a} 100 104)`}>
                <path d={ray} />
                <path d="M100 104 L94 78 L91.5 58 L97.5 77Z" transform="rotate(-9 100 104)" />
                <path d="M100 104 L102.5 77 L108.5 58 L106 78Z" transform="rotate(9 100 104)" />
              </g>
            ))}
          </g>
          <circle cx="100" cy="104" r="26" fill="#e9a20f" />
          <circle cx="100" cy="104" r="23.5" fill="#f6b81a" />
          <circle cx="100" cy="104" r="20.5" fill="none" stroke="#e9a20f" strokeWidth="1.4" strokeDasharray="2.2 2.8" />
          <circle cx="100" cy="104" r="17.5" fill="url(#splash-core)" />
          <circle cx="94" cy="97" r="4" fill="#fff" opacity=".35" />
        </g>
        <path className="splash-mtn-back" d="M0 166 L46 126 L72 144 L112 110 L150 140 L170 126 L200 148 L200 200 L0 200Z" fill="#61ab73" />
        <g className="splash-mtn-front">
          <path d="M0 172 L38 140 L70 162 L104 124 L146 168 L176 150 L200 166 L200 200 L0 200Z" fill="#f4f3ee" />
          <path d="M104 124 L92 138 L100 135 L106 142 L112 134 L118 139Z" fill="#bfdcc6" />
        </g>
      </g>
      {/* Three stars: Luzon, Visayas, Mindanao */}
      {[
        [42, 32],
        [88, 12],
        [134, 32],
      ].map(([x, y], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path
            className="splash-star"
            style={{ animationDelay: `${0.75 + i * 0.1}s` }}
            d={star}
            fill="#ffd25e"
            stroke="#183b22"
            strokeWidth="1.6"
            strokeLinejoin="round"
            paintOrder="stroke"
          />
        </g>
      ))}
    </svg>
  );
}

function Truck() {
  return (
    <div className="splash-truck" aria-hidden>
      <svg viewBox="0 0 150 86" className="splash-truck-body h-full w-full">
        <rect x="22" y="6" width="64" height="9" rx="3" fill="#4e7a5a" />
        <rect x="20" y="15" width="70" height="3" rx="1.5" fill="#272928" />
        <path d="M18 20 H92 L110 40 H136 a6 6 0 0 1 6 6 V62 H10 V28 a8 8 0 0 1 8-8Z" fill="#183b22" />
        <path d="M26 26 H54 V40 H26Z M60 26 H88 L102 40 H60Z" fill="#cfe6d6" />
        <rect x="134" y="46" width="8" height="5" rx="1.5" fill="#f6b81a" />
        <rect x="10" y="48" width="132" height="4" fill="#61ab73" />
        <rect x="2" y="32" width="8" height="22" rx="2" fill="#272928" />
      </svg>
      {[23, 99].map((x) => (
        <svg key={x} viewBox="0 0 30 30" className="splash-wheel" style={{ left: `${(x / 150) * 100}%` }}>
          <circle cx="15" cy="15" r="15" fill="#272928" />
          <circle cx="15" cy="15" r="6" fill="#d9d9d4" />
          <rect x="13.5" y="2" width="3" height="26" fill="#3a3d3b" />
        </svg>
      ))}
    </div>
  );
}

/**
 * A short intro on the first page load of a visit: the sun rises in the emblem, SAKALAM drops in letter by
 * letter and a rig drives across, then the whole thing lifts away. Click or press any key to skip.
 */
export function Splash() {
  const [stage, setStage] = useState<'show' | 'leave' | 'gone'>(() => (showOnce() ? 'show' : 'gone'));

  useEffect(() => {
    if (stage === 'gone') return;
    if (stage === 'leave') {
      const t = window.setTimeout(() => setStage('gone'), EXIT_MS);
      return () => window.clearTimeout(t);
    }
    document.documentElement.style.overflow = 'hidden';
    const skip = () => setStage('leave');
    const t = window.setTimeout(skip, SHOW_MS);
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', skip);
      document.documentElement.style.overflow = '';
    };
  }, [stage]);

  if (stage === 'gone') return null;

  return (
    <div aria-hidden onClick={() => setStage('leave')} className={`splash ${stage === 'leave' ? 'splash-leave' : ''}`}>
      <div className="splash-topbar" />
      <svg className="splash-ridge" viewBox="0 0 1440 110" preserveAspectRatio="none">
        <path d="M0 70 L120 40 L230 66 L360 18 L470 58 L600 30 L720 64 L860 22 L990 60 L1110 34 L1240 62 L1350 28 L1440 50 L1440 110 L0 110Z" fill="var(--splash-ridge-back)" />
        <path d="M0 90 L160 64 L300 86 L460 58 L620 88 L780 62 L940 90 L1100 66 L1260 88 L1440 70 L1440 110 L0 110Z" fill="var(--splash-ridge-front)" />
      </svg>
      <div className="splash-road" />
      <Truck />

      <div className="relative flex flex-col items-center gap-2 px-4 pb-16 text-center md:gap-3">
        <Emblem />
        <p className="splash-fade font-baybayin text-lg tracking-[0.35em] text-[var(--splash-moss)] md:text-xl" style={{ animationDelay: '1.05s' }} lang="tl">
          ᜐᜃᜎᜋ᜔
        </p>
        <p className="flex font-display text-6xl leading-[0.9] font-extrabold text-[var(--splash-title)] sm:text-7xl md:text-8xl">
          {'SAKALAM'.split('').map((l, i) => (
            <span key={i} className="splash-letter" style={{ animationDelay: `${0.7 + i * 0.07}s` }}>
              {l}
            </span>
          ))}
        </p>
        <p className="splash-sub font-display text-lg font-semibold text-dahon md:text-2xl">
          OVERLAND <span className="text-[0.55em] tracking-[0.15em] text-araw">★★★</span>
        </p>
        <p className="splash-fade font-body text-base font-light text-[var(--splash-ink)] md:text-lg" style={{ animationDelay: '1.7s' }}>
          <span className="font-normal text-[var(--splash-title)]">Sama-sama sa daan</span>: together on the trail.
        </p>
      </div>
    </div>
  );
}
