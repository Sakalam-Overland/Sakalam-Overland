import { useEffect } from 'react';

const SITE = 'Sakalam Overland';
const HOME = 'Sakalam Overland: Filipino-founded overland crew, New York';

/** Sets the browser tab title, e.g. "Events · Sakalam Overland". No title gives the home page's. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : HOME;
  }, [title]);
}
