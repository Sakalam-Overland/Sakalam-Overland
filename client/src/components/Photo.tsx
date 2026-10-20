import { useState } from 'react';
import { starPath } from './SunMark';

type Tone = 'forest' | 'dusk' | 'dawn' | 'night';

const tones: Record<Tone, { sky: [string, string]; ridges: string[]; sun: string }> = {
  forest: { sky: ['#61ab73', '#e6f2e9'], ridges: ['#3f7d50', '#224d2e', '#183b22', '#0e2615'], sun: '#f6b81a' },
  dusk: { sky: ['#272928', '#183b22'], ridges: ['#224d2e', '#183b22', '#0e2615', '#000000'], sun: '#f6b81a' },
  dawn: { sky: ['#f6d77a', '#e6f2e9'], ridges: ['#61ab73', '#3f7d50', '#224d2e', '#183b22'], sun: '#ffffff' },
  night: { sky: ['#000000', '#183b22'], ridges: ['#183b22', '#0e2615', '#272928', '#000000'], sun: '#f6b81a' },
};

/** Deterministic ridge line so each placeholder gets its own skyline. */
function ridge(seed: number, layer: number) {
  let x = seed * 9301 + layer * 49297;
  const rand = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const base = 52 + layer * 11;
  const pts = [`0,${base + rand() * 8}`];
  for (let i = 1; i <= 8; i++) pts.push(`${i * 12.5},${base - 4 - rand() * (22 - layer * 4)}`);
  return `M${pts.join(' L')} L100,100 L0,100Z`;
}

/**
 * A photo slot. Drop an image at /public/photos/{name}.jpg and it shows up;
 * until then it renders a brand illustration so the layout never looks empty.
 */
export function Photo({
  name,
  alt,
  tone = 'forest',
  className = '',
  caption,
  fallback,
}: {
  name: string;
  alt: string;
  tone?: Tone;
  className?: string;
  caption?: string;
  /** Art to show until a real photo exists; defaults to a drawn ridge scene. */
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const seed = [...name].reduce((n, c) => n + c.charCodeAt(0), 0);
  const t = tones[tone];

  return (
    <figure className={`relative overflow-hidden bg-gubat ${className}`}>
      {!failed ? (
        <img
          src={`/photos/${name}.jpg`}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-(--ease-trail) group-hover:scale-105"
        />
      ) : fallback ? (
        <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full">{fallback}</div>
      ) : (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={alt}>
          <defs>
            <linearGradient id={`sky-${name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={t.sky[0]} />
              <stop offset="1" stopColor={t.sky[1]} />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#sky-${name})`} />
          <circle cx={30 + (seed % 40)} cy={44} r={10} fill={t.sun} opacity={0.95} />
          {tone === 'night' &&
            [0, 1, 2].map((i) => <path key={i} d={starPath(18 + i * 32, 14 + (i % 2) * 8, 1.6)} fill="#fff" opacity={0.8} />)}
          {t.ridges.map((c, i) => (
            <path key={i} d={ridge(seed, i)} fill={c} />
          ))}
        </svg>
      )}
      {caption && (
        <figcaption className="eyebrow absolute bottom-4 left-4 rounded-full bg-itim/60 px-3 py-1.5 text-puti backdrop-blur">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
