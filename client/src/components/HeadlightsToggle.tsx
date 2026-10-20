import { useId } from 'react';
import { useTheme } from '../lib/theme';

/**
 * Theme switch drawn as the front of a rig. Headlights on = Gabi (night) mode,
 * headlights off = Araw (day) mode.
 */
export function HeadlightsToggle({ className = '' }: { className?: string }) {
  const { theme, toggle, hint, dismissHint } = useTheme();
  const hintId = useId();
  const on = theme === 'dark';
  const label = on ? 'Headlights on: night mode' : 'Headlights off: day mode';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
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
            on ? 'bg-gubat-900 text-puti ring-araw' : 'bg-puti text-gubat ring-current/20 group-hover:ring-araw'
          }`}
        >
          <svg viewBox="0 0 64 40" className="h-6 w-9 overflow-visible" aria-hidden>
            <defs>
              <radialGradient id="hl-glow">
                <stop offset="0" stopColor="#f6b81a" stopOpacity="0.85" />
                <stop offset="1" stopColor="#f6b81a" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Glow and rays, only with the lights on */}
            <g className={`origin-center transition duration-500 ease-(--ease-trail) ${on ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
              {[21, 43].map((cx) => (
                <g key={cx}>
                  <circle cx={cx} cy="21" r="12" fill="url(#hl-glow)" />
                  {[-60, -20, 20, 60, 180].map((a) => (
                    <line
                      key={a}
                      x1={cx + Math.cos(((a + 90) * Math.PI) / 180) * 7}
                      y1={21 + Math.sin(((a + 90) * Math.PI) / 180) * 7}
                      x2={cx + Math.cos(((a + 90) * Math.PI) / 180) * 11}
                      y2={21 + Math.sin(((a + 90) * Math.PI) / 180) * 11}
                      stroke="#f6b81a"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  ))}
                </g>
              ))}
            </g>
            {/* Roof rack, cab, body, grille, bumper, tires */}
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M20,4 H44" strokeLinecap="round" />
              <path d="M19,13 L22,7 H42 L45,13" />
              <rect x="12" y="13" width="40" height="16" rx="4" />
              <path d="M29,17 V25 M32,17 V25 M35,17 V25" strokeLinecap="round" />
              <path d="M10,31 H54" strokeLinecap="round" />
              <path d="M15,31 V36 H21 V31 M43,31 V36 H49 V31" />
            </g>
            {/* Headlights */}
            {[21, 43].map((cx) => (
              <circle
                key={cx}
                cx={cx}
                cy="21"
                r="3.6"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-colors duration-300 ${on ? 'fill-araw' : 'fill-transparent'}`}
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
            <button type="button" onClick={toggle} className="rounded-full bg-araw px-3.5 py-1.5 font-display text-xs font-semibold text-itim transition hover:brightness-110">
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
