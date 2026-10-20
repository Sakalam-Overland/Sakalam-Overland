import * as seed from '@shared/data';
import type { Campsite, JoinInput, Rig, RsvpInput, Trail, TripEvent } from '@shared/types';

const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** True once a request shows there's no API behind us, e.g. on a static deploy. */
let offline = false;
export const isOffline = () => offline;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!isJson) throw new TypeError('No API');
  const body = await res.json();
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'Request failed', body.fields);
  return body as T;
}

/** Read from the API and fall back to the bundled data if it's unreachable. */
async function read<T>(path: string, fallback: () => T): Promise<T> {
  if (offline) return fallback();
  try {
    return await request<T>(path);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    offline = true;
    return fallback();
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export const api = {
  events: (upcoming = true) =>
    read<TripEvent[]>(`/api/events${upcoming ? '?upcoming=true' : ''}`, () =>
      [...seed.events].filter((e) => !upcoming || e.end >= today()).sort((a, b) => a.start.localeCompare(b.start)),
    ),
  event: (slug: string) =>
    read<TripEvent>(`/api/events/${slug}`, () => {
      const e = seed.events.find((x) => x.slug === slug);
      if (!e) throw new ApiError(404, 'Event not found');
      return e;
    }),
  trails: () => read<Trail[]>('/api/trails', () => seed.trails),
  campsites: () => read<Campsite[]>('/api/campsites', () => seed.campsites),
  rigs: () => read<Rig[]>('/api/rigs', () => seed.rigs),

  async rsvp(slug: string, input: RsvpInput): Promise<{ event: TripEvent; waitlisted: boolean }> {
    if (!offline) {
      try {
        return await request(`/api/events/${slug}/rsvp`, { method: 'POST', body: JSON.stringify(input) });
      } catch (err) {
        if (err instanceof ApiError) throw err;
        offline = true;
      }
    }
    // Demo mode: remember the RSVP in this browser only.
    const event = { ...(await api.event(slug)) };
    const key = `rsvp:${slug}`;
    if (localStorage.getItem(key) === input.email.toLowerCase()) {
      throw new ApiError(409, "You're already on the list for this one.");
    }
    localStorage.setItem(key, input.email.toLowerCase());
    const waitlisted = event.rsvps >= event.capacity;
    if (!waitlisted) event.rsvps += 1;
    return { event, waitlisted };
  },

  async join(input: JoinInput): Promise<{ welcome: boolean }> {
    if (!offline) {
      try {
        return await request('/api/members', { method: 'POST', body: JSON.stringify(input) });
      } catch (err) {
        if (err instanceof ApiError) throw err;
        offline = true;
      }
    }
    return { welcome: true };
  },
};
