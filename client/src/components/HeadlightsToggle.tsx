import { useId, useRef } from 'react';
import { useTheme } from '../lib/theme';

/**
 * Theme switch drawn as the front of a rig. Headlights on = Gabi (night) mode,
 * headlights off = Araw (day) mode.
 */
const lights = [17.5, 46.5];
const LIGHT_Y = 23.5;

export function HeadlightsToggle({ className = '' }: { className?: string }) {
  const { theme, toggle, hint, dismissHint } = useTheme();
  const hintId = useId();
  const btn = useRef<HTMLButtonElement>(null);
  // Start the reveal from the headlights, even when the hint's button is used.
  const flip = () => {
    const r = btn.current?.getBoundingClientRect();
    toggle(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
  };
  const on = theme === 'dark';
  const glowId = `hl-glow-${useId().replace(/:/g, '')}`;
  const label = on ? 'Headlights on: night mode' : 'Headlights off: day mode';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        ref={btn}
        onClick={flip}
        aria-pressed={on}
        aria-label={`${label}. Switch to ${on ? 'day' : 'night'} mode`}
        aria-describedby={hint ? hintId : undefined}
        title={label}
        className="group relative grid h-11 w-11 place-items-center rounded-full"
      >
        {/* Pulse until the visitor has found it */}
        {hint && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-araw/50 motion-reduce:hidden" />}
        <span
          className={`relative grid h-11 w-11 place-items-center rounded-full shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)] ring-2 transition duration-300 group-hover:scale-110 group-active:scale-95 ${
            on ? 'bg-gubat-900 ring-araw' : 'bg-puti ring-gubat/15 group-hover:ring-araw'
          }`}
        >
          <svg viewBox="0 0 64 44" className="h-7 w-10 overflow-visible" aria-hidden>
            <defs>
              <radialGradient id={glowId}>
                <stop offset="0" stopColor="#f6b81a" stopOpacity="0.9" />
                <stop offset="0.45" stopColor="#f6b81a" stopOpacity="0.35" />
                <stop offset="1" stopColor="#f6b81a" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Glow and short rays, only with the lights on */}
            <g className={`origin-center transition duration-500 ease-(--ease-trail) ${on ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
              {lights.map((cx) => (
                <g key={cx}>
                  <circle cx={cx} cy={LIGHT_Y} r="13" fill={`url(#${glowId})`} />
                  {[-50, 0, 50].map((a) => {
                    const rad = ((a + (cx < 32 ? 180 : 0)) * Math.PI) / 180;
                    return (
                      <line
                        key={a}
                        x1={cx + Math.cos(rad) * 8}
                        y1={LIGHT_Y + Math.sin(rad) * 8}
                        x2={cx + Math.cos(rad) * 12}
                        y2={LIGHT_Y + Math.sin(rad) * 12}
                        stroke="#f6b81a"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>
              ))}
            </g>
            <g className="transition-colors duration-300">
              {/* Roof rack with a strapped-down load */}
              <rect x="22" y="1.5" width="20" height="3.5" rx="1.2" className="fill-araw" />
              <rect x="17" y="5" width="30" height="2" rx="1" className={on ? 'fill-abo' : 'fill-uling'} />
              {/* Cab and windshield */}
              <path d="M17,17 L21.5,7 H42.5 L47,17 Z" className={on ? 'fill-dahon' : 'fill-gubat'} />
              <path d="M21.5,15.5 L24.5,9.5 H39.5 L42.5,15.5 Z" className={on ? 'fill-gubat-900' : 'fill-dahon-100'} />
              <path d="M26,14 L29,10.5 H31.5 L28.5,14 Z" className={on ? 'fill-puti/25' : 'fill-puti'} />
              {/* Mirrors */}
              <rect x="10.5" y="12" width="5" height="3.5" rx="1" className={on ? 'fill-dahon' : 'fill-gubat'} />
              <rect x="48.5" y="12" width="5" height="3.5" rx="1" className={on ? 'fill-dahon' : 'fill-gubat'} />
              {/* Body */}
              <rect x="10" y="16" width="44" height="15" rx="4" className={on ? 'fill-dahon' : 'fill-gubat'} />
              {/* Grille */}
              <rect x="25" y="18.5" width="14" height="10" rx="2" className="fill-gubat-900" />
              <path d="M28.5,20.5 V26.5 M32,20.5 V26.5 M35.5,20.5 V26.5" strokeWidth="1.6" strokeLinecap="round" className={on ? 'stroke-dahon-300' : 'stroke-puti/55'} />
              {/* Bumper and tires */}
              <rect x="7" y="31" width="50" height="4.5" rx="2.25" className={on ? 'fill-abo' : 'fill-uling'} />
              <rect x="13" y="35.5" width="9" height="6.5" rx="2" className={on ? 'fill-uling-600' : 'fill-itim'} />
              <rect x="42" y="35.5" width="9" height="6.5" rx="2" className={on ? 'fill-uling-600' : 'fill-itim'} />
            </g>
            {/* Headlights */}
            {lights.map((cx) => (
              <circle
                key={cx}
                cx={cx}
                cy={LIGHT_Y}
                r="4.2"
                strokeWidth="1.6"
                className={`transition-colors duration-300 ${on ? 'fill-araw stroke-[#fff3c4]' : 'fill-[#e7eae6] stroke-gubat-900'}`}
              />
            ))}
          </svg>
        </span>
      </button>

      {hint && (
        <div
          id={hintId}
          data-theme-hint
          role="status"
          className="absolute top-full right-0 z-10 mt-4 w-64 origin-top-right animate-[pop_0.45s_var(--ease-trail)] rounded-2xl bg-btn p-4 text-left text-btn-ink shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)]"
        >
          {/* Speech-bubble tail pointing at the button */}
          <span aria-hidden className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 bg-btn" />
          <p className="eyebrow opacity-75">Bago · New</p>
          <p className="mt-1 font-display text-sm font-bold">{on ? 'Prefer daylight?' : 'Riding after dark?'}</p>
          <p className="mt-1 text-sm leading-snug opacity-85">
            {on ? 'Switch off the headlights for day mode.' : 'Flip on the headlights for night mode.'} Tap them anytime to switch back.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={flip} className="rounded-full bg-araw px-3.5 py-1.5 font-display text-xs font-semibold text-itim transition hover:brightness-110">
              {on ? 'Lights off' : 'Lights on'}
            </button>
            <button type="button" onClick={dismissHint} className="font-display text-xs font-semibold underline-offset-2 opacity-75 hover:underline hover:opacity-100">
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
