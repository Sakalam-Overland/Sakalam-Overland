import { type RefObject, useLayoutEffect } from 'react';

/** Text that fades up the first time it scrolls into view. */
const TEXT = 'h1, h2, h3, h4, p, li, dt, dd, blockquote, figcaption';
/** Things that already animate themselves, or shouldn't move at all. */
const SKIP = '[data-reveal], [data-no-reveal], [class*="animate-"], svg, form, [role="status"], [aria-live]';
const STAGGER_MS = 70;

/**
 * One entrance for the whole site. Every <Reveal> block and every loose piece of
 * text inside `root` starts hidden and eases up once, as it first enters the viewport.
 * Attributes are removed afterwards so hover transitions behave normally again.
 */
export function useAutoReveal(root: RefObject<HTMLElement | null>, key: string) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timers = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((e, i) => {
            const t = e.target as HTMLElement;
            io.unobserve(t);
            if (!t.style.transitionDelay) t.style.transitionDelay = `${Math.min(i, 6) * STAGGER_MS}ms`;
            t.setAttribute('data-revealed', '');
            const delay = parseFloat(t.style.transitionDelay) || 0;
            const id = window.setTimeout(() => {
              t.removeAttribute('data-reveal');
              t.removeAttribute('data-revealed');
              t.style.transitionDelay = '';
              timers.delete(id);
            }, 1300 + delay);
            timers.add(id);
          });
      },
      { rootMargin: '0px 0px -6% 0px' },
    );

    const scan = (node: ParentNode) => {
      node.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])').forEach((n) => io.observe(n));
      // Document order means a parent is tagged before its children, so nested text is skipped.
      node.querySelectorAll<HTMLElement>(TEXT).forEach((n) => {
        if (n.closest(SKIP) || !n.textContent?.trim()) return;
        n.setAttribute('data-reveal', '');
        io.observe(n);
      });
    };
    scan(el);

    // Pick up content that arrives later (fetched lists, filters, tab changes).
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n.parentElement ?? n));
    });
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [root, key]);
}
