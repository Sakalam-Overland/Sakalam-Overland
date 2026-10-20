import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'sakalam:theme';
const HINT_KEY = 'sakalam:theme-hint-seen';

type Ctx = { theme: Theme; toggle: () => void; hint: boolean; dismissHint: () => void };
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

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      store(KEY, next);
      return next;
    });
    dismissHint();
  }, [dismissHint]);

  return <ThemeContext.Provider value={{ theme, toggle, hint, dismissHint }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
