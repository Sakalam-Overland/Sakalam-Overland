import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

const KEY = 'sakalam:theme';
const HINT_KEY = 'sakalam:theme-hint-seen';

/** Where the switch was pressed, so the new theme can spread out from that point. */
export type Origin = { x: number; y: number };

type Ctx = { theme: Theme; toggle: (origin?: Origin) => void; hint: boolean; dismissHint: () => void };
const ThemeContext = createContext<Ctx>({ theme: 'light', toggle: () => {}, hint: false, dismissHint: () => {} });

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the choice still holds for this visit */
  }
};

const hintSeen = () => {
  try {
    return localStorage.getItem(HINT_KEY) === '1' || localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
};

// index.html sets data-theme before first paint, so start from whatever it chose.
const initial = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const [hint, setHint] = useState(false);

  // First-time visitors get a nudge toward the toggle once the page has settled.
  useEffect(() => {
    if (hintSeen()) return;
    const t = window.setTimeout(() => setHint(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  const dismissHint = useCallback(() => {
    setHint(false);
    store(HINT_KEY, '1');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#060b08' : '#12301c');
  }, [theme]);

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const toggle = useCallback(
    (origin?: Origin) => {
      const next: Theme = themeRef.current === 'dark' ? 'light' : 'dark';
      store(KEY, next);
      dismissHint();
      const apply = () => {
        document.documentElement.dataset.theme = next;
        flushSync(() => setTheme(next));
      };

      const root = document.documentElement;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();

      // Headlights on: the new theme spreads out in a circle from the switch.
      if (document.startViewTransition) {
        const x = origin?.x ?? window.innerWidth - 80;
        const y = origin?.y ?? 40;
        const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const vt = document.startViewTransition(apply);
        vt.ready
          .then(() =>
            root.animate(
              { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
              { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
            ),
          )
          .catch(() => {});
        return;
      }

      // Older browsers: a short cross-fade of every color on the page.
      root.classList.add('theme-fade');
      apply();
      window.setTimeout(() => root.classList.remove('theme-fade'), 500);
    },
    [dismissHint],
  );

  return <ThemeContext.Provider value={{ theme, toggle, hint, dismissHint }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
