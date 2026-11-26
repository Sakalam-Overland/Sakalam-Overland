import type { GalleryItem } from '@shared/types';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { InstagramIcon } from './Layout';
import { Photo } from './Photo';

const PHOTO_MS = 6000;
const VIDEO_MS = 12000;
const tones = ['forest', 'dawn', 'night', 'dusk'] as const;

/** "https://www.instagram.com/p/ABC123/?img_index=1" -> "https://www.instagram.com/p/ABC123/embed" */
export function instagramEmbed(url?: string) {
  const m = url?.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
}

const kindOf = (s: GalleryItem) => (instagramEmbed(s.instagram) ? 'instagram' : s.video ? 'video' : 'photo');

/** One slide's media. Instagram embeds and videos only load once their slide has been shown. */
function SlideMedia({ slide, index, loaded }: { slide: GalleryItem; index: number; loaded: boolean }) {
  const kind = kindOf(slide);
  if (kind === 'photo') {
    return <Photo name={`gallery-${index}`} src={slide.image} alt={slide.alt} tone={tones[index % tones.length]} className="h-full w-full" />;
  }
  if (kind === 'video') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-itim">
        {loaded && (
          <video src={slide.video} poster={slide.image || undefined} controls playsInline preload="metadata" className="h-full w-full object-contain" aria-label={slide.alt}>
            {slide.alt}
          </video>
        )}
      </div>
    );
  }
  // Instagram: the post's own player, beside a short caption and a link out.
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-gubat-900 px-4 py-4 text-puti md:flex-row md:gap-10">
      <div className="hidden max-w-xs md:block">
        <p className="eyebrow text-dahon-300">Watch</p>
        <p className="mt-2 font-display text-3xl font-bold">{slide.caption}</p>
        <p className="mt-2 text-sm text-puti/80">{slide.alt}</p>
        <a href={slide.instagram} target="_blank" rel="noreferrer" className="btn-ghost mt-5 text-puti">
          <InstagramIcon className="h-4 w-4" /> Open on Instagram
        </a>
      </div>
      <div className="h-full w-full max-w-[340px] overflow-hidden rounded-2xl bg-puti">
        {loaded && (
          <iframe
            src={instagramEmbed(slide.instagram)!}
            title={`Instagram video: ${slide.caption}`}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            className="h-[calc(100%+120px)] w-full border-0"
          />
        )}
      </div>
    </div>
  );
}

/**
 * The "From the trail" slideshow: photos, uploaded videos and Instagram posts from the CMS.
 * Moves on its own (unless the visitor prefers reduced motion), pauses on hover, focus or while a
 * video is being watched, and can be driven with the arrows, the thumbnails or the arrow keys.
 */
export function Slideshow({ slides }: { slides: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false); // hover or keyboard focus inside
  const [seen, setSeen] = useState(() => new Set([0]));
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const count = slides.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const go = useCallback(
    (next: number) => {
      const i = (next + count) % count;
      setIndex(i);
      setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
    },
    [count],
  );

  // Auto-advance. Clicking into an Instagram player moves focus into its iframe, which also holds it.
  const current = slides[index];
  const autoplay = playing && !held && !reduced && count > 1;
  useEffect(() => {
    if (!autoplay || !current) return;
    const t = window.setTimeout(() => {
      const watching = document.activeElement?.tagName === 'IFRAME' && root.current?.contains(document.activeElement);
      if (!watching) go(index + 1);
    }, kindOf(current) === 'photo' ? PHOTO_MS : VIDEO_MS);
    return () => window.clearTimeout(t);
  }, [autoplay, index, current, go]);

  // Pause any uploaded video that slides out of view.
  useEffect(() => {
    root.current?.querySelectorAll<HTMLVideoElement>('[aria-hidden="true"] video').forEach((v) => v.pause());
  }, [index]);

  if (!count) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos and videos from the trail"
      onKeyDown={onKey}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
    >
      <div className="relative h-[clamp(420px,62svh,560px)] overflow-hidden rounded-3xl bg-gubat-900">
        {slides.map((s, i) => (
          <div
            key={`${i}-${s.caption}`}
            id={`${id}-slide-${i}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${s.caption}`}
            aria-hidden={i !== index}
            inert={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-(--ease-trail) motion-reduce:transition-none ${i === index ? 'z-10 opacity-100' : 'opacity-0'}`}
          >
            <SlideMedia slide={s} index={i} loaded={seen.has(i) || i === (index + 1) % count} />
            {kindOf(s) === 'photo' && s.caption && (
              <p className="eyebrow absolute bottom-4 left-4 z-10 rounded-full bg-itim/60 px-3 py-1.5 text-puti backdrop-blur">{s.caption}</p>
            )}
          </div>
        ))}

        {count > 1 && (
          <>
            {(['prev', 'next'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(index + (dir === 'next' ? 1 : -1))}
                aria-label={dir === 'next' ? 'Next slide' : 'Previous slide'}
                className={`absolute top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-puti/90 text-gubat shadow-lg ring-1 ring-itim/10 transition hover:bg-puti ${dir === 'next' ? 'right-3 md:right-4' : 'left-3 md:left-4'}`}
              >
                <svg viewBox="0 0 24 24" className={`h-5 w-5 ${dir === 'prev' ? 'rotate-180' : ''}`} aria-hidden>
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
            {!reduced && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                className="absolute top-3 right-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-itim/55 text-puti backdrop-blur transition hover:bg-itim/75 md:top-4 md:right-4"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /> : <path d="M8 5l11 7-11 7z" fill="currentColor" />}
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* Thumbnails double as the slide picker */}
      {count > 1 && (
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto p-1 md:mt-4">
          {slides.map((s, i) => {
            const kind = kindOf(s);
            return (
              <button
                key={`${i}-${s.caption}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}: ${s.caption}${kind === 'photo' ? '' : ' (video)'}`}
                aria-controls={`${id}-slide-${i}`}
                aria-current={i === index}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition md:h-16 md:w-24 ${i === index ? 'ring-araw' : 'opacity-70 ring-transparent hover:opacity-100'}`}
              >
                {s.image ? (
                  <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="block h-full w-full bg-gradient-to-br from-gubat-700 to-gubat-900" />
                )}
                {kind !== 'photo' && (
                  <span className="absolute inset-0 grid place-items-center bg-itim/30">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-puti drop-shadow" aria-hidden>
                      <path d="M8 5l11 7-11 7z" fill="currentColor" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {autoplay ? '' : `Slide ${index + 1} of ${count}: ${current?.caption ?? ''}`}
      </p>
    </div>
  );
}
