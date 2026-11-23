import { useId, useRef } from 'react';
import { useTheme } from '../lib/theme';

/**
 * Theme switch drawn as the front of a rig. Headlights on = Gabi (night) mode,
 * headlights off = Araw (day) mode.
 */
const lights = [12.5, 35.5];
const LIGHT_Y = 19.5;

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
  const uid = useId().replace(/:/g, '');
  const glowId = `hl-glow-${uid}`;
  const maskId = `hl-rig-${uid}`;
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
        className="group relative grid h-10 w-10 place-items-center rounded-full"
      >
        {/* Pulse until the visitor has found it */}
        {hint && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-araw/50 motion-reduce:hidden" />}
        <span
          className={`relative grid h-10 w-10 place-items-center rounded-full ring-1 transition duration-300 ease-(--ease-trail) group-hover:-translate-y-px group-active:translate-y-0 ${
            on
              ? 'bg-[radial-gradient(circle_at_50%_30%,#1d4029,#08170d_75%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_3px_rgba(246,184,26,0.12),0_6px_18px_-6px_rgba(246,184,26,0.55)] ring-araw/60'
              : 'bg-[radial-gradient(circle_at_50%_25%,#ffffff,#eef2ec_80%)] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(24,59,34,0.1),0_6px_14px_-6px_rgba(24,59,34,0.35)] ring-gubat/10 group-hover:ring-gubat/25'
          }`}
        >
          <svg viewBox="0 0 48 36" className="h-[22px] w-[30px] overflow-visible" aria-hidden>
            <defs>
              <radialGradient id={glowId}>
                <stop offset="0" stopColor="#ffd666" stopOpacity="0.85" />
                <stop offset="0.5" stopColor="#f6b81a" stopOpacity="0.3" />
                <stop offset="1" stopColor="#f6b81a" stopOpacity="0" />
              </radialGradient>
              {/* The rig as one silhouette, with the glass, grille slots and lamps cut out of it */}
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="36">
                <rect x="11" y="1.6" width="26" height="1.6" rx="0.8" fill="#fff" />
                <path d="M13.5,3 V5 M34.5,3 V5" stroke="#fff" strokeWidth="1.4" />
                <path d="M9,14 L11.1,6.2 Q11.4,5 12.6,5 H35.4 Q36.6,5 36.9,6.2 L39,14 Z" fill="#fff" />
                <rect x="2.8" y="10.2" width="4" height="3" rx="1" fill="#fff" />
                <rect x="41.2" y="10.2" width="4" height="3" rx="1" fill="#fff" />
                <rect x="6" y="13" width="36" height="12.5" rx="3.5" fill="#fff" />
                <rect x="4" y="26.4" width="40" height="3" rx="1.5" fill="#fff" />
                <rect x="9" y="30" width="7" height="5" rx="1.6" fill="#fff" />
                <rect x="32" y="30" width="7" height="5" rx="1.6" fill="#fff" />
                {/* cut-outs */}
                <path d="M11.9,12.4 L13.3,7.6 Q13.5,7 14.1,7 H33.9 Q34.5,7 34.7,7.6 L36.1,12.4 Z" fill="#000" />
                <path d="M15,11.6 L16.2,8 H18.6 L17.4,11.6 Z" fill="#fff" opacity="0.55" />
                <rect x="20.6" y="16.3" width="1.5" height="6" rx="0.75" fill="#000" />
                <rect x="23.25" y="16.3" width="1.5" height="6" rx="0.75" fill="#000" />
                <rect x="25.9" y="16.3" width="1.5" height="6" rx="0.75" fill="#000" />
                {lights.map((cx) => (
                  <circle key={cx} cx={cx} cy={LIGHT_Y} r="3.2" fill="#000" />
                ))}
              </mask>
            </defs>
            {/* Soft glow in front of the lamps, only with the lights on */}
            <g className={`transition duration-500 ease-(--ease-trail) ${on ? 'opacity-100' : 'opacity-0'}`}>
              {lights.map((cx) => (
                <circle key={cx} cx={cx} cy={LIGHT_Y} r="9" fill={`url(#${glowId})`} />
              ))}
            </g>
            <rect width="48" height="36" mask={`url(#${maskId})`} className={`transition-colors duration-300 ${on ? 'fill-[#eef1ea]' : 'fill-gubat'}`} />
            {/* Lamps: a thin chrome ring by day, lit by night */}
            {lights.map((cx) => (
              <circle
                key={cx}
                cx={cx}
                cy={LIGHT_Y}
                r="2.3"
                strokeWidth="1"
                className={`transition-colors duration-300 ${on ? 'fill-[#ffd666] stroke-[#fff6d6]' : 'fill-transparent stroke-gubat/45'}`}
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
