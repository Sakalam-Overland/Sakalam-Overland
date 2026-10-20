import { useEffect, useRef } from 'react';

/** Marks the element data-paused while it's off screen, which stops its looping CSS animations. */
export function usePauseOffscreen<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-paused', !e.isIntersecting), { rootMargin: '120px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
