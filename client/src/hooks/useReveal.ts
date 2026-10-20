import { useEffect, useRef, useState } from 'react';

/** Flips to true the first time the element scrolls into view. */
export function useReveal<T extends Element>(margin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, shown]);

  return [ref, shown] as const;
}
