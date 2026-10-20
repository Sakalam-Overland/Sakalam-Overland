import type { Difficulty, TripEvent } from '@shared/types';

/** Parse a YYYY-MM-DD string as a local date (not UTC midnight). */
export const localDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const fmt = {
  day: (iso: string) => localDate(iso).getDate().toString().padStart(2, '0'),
  month: (iso: string) => localDate(iso).toLocaleString('en-US', { month: 'short' }),
  weekday: (iso: string) => localDate(iso).toLocaleString('en-US', { weekday: 'short' }),
  long: (iso: string) => localDate(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  range(e: Pick<TripEvent, 'start' | 'end'>) {
    if (e.start === e.end) return fmt.long(e.start);
    const a = localDate(e.start);
    const b = localDate(e.end);
    const sameMonth = a.getMonth() === b.getMonth();
    const left = a.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const right = b.toLocaleDateString('en-US', sameMonth ? { day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
    return `${left}–${right}`;
  },
  coords: ([lat, lng]: [number, number]) =>
    `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lng).toFixed(3)}°${lng >= 0 ? 'E' : 'W'}`,
};

export const daysUntil = (iso: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((localDate(iso).getTime() - now.getTime()) / 86_400_000);
};

export const difficultyMeta: Record<Difficulty, { label: string; level: number; note: string }> = {
  easy: { label: 'Easy', level: 1, note: 'Stock rigs welcome' },
  moderate: { label: 'Moderate', level: 2, note: 'AWD and good tires' },
  difficult: { label: 'Difficult', level: 3, note: 'Lift, armor and lockers help' },
  extreme: { label: 'Extreme', level: 4, note: 'Built rigs only' },
};

export const directionsUrl = ([lat, lng]: [number, number]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/** Build an .ics file so members can drop an event straight into their calendar. */
export function icsFor(e: TripEvent) {
  const d = (iso: string, plus = 0) => {
    const x = localDate(iso);
    x.setDate(x.getDate() + plus);
    return `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}`;
  };
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sakalam Overland//Events//EN',
    'BEGIN:VEVENT',
    `UID:${e.slug}@sakalamoverland`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d(e.start)}`,
    `DTEND;VALUE=DATE:${d(e.end, 1)}`,
    `SUMMARY:${esc(`Sakalam Overland · ${e.title}`)}`,
    `LOCATION:${esc(e.location)}`,
    `DESCRIPTION:${esc(`Meet ${e.meetTime}. ${e.summary}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
}
