import type { Trail } from '@shared/types';
import { useEffect, useState } from 'react';

/** What the site needs to describe a route: an elevation profile plus its length and climb. */
export interface RouteShape {
  /** [mile, feet] pairs, start to finish. Empty when there's nothing to chart. */
  profile: [number, number][];
  lengthMi?: number;
  gainFt?: number;
  /** Where the numbers came from, so the page can say so. */
  source: 'gpx' | 'manual' | 'none';
}

type Pt = { lat: number; lon: number; ele?: number };

const FT_PER_M = 3.28084;
const MI_PER_KM = 0.621371;
/** Most points the chart needs; also Open-Meteo's limit for one elevation lookup. */
const MAX_POINTS = 100;
/** Ignore climbs smaller than this so GPS jitter doesn't inflate the gain. */
const GAIN_THRESHOLD_M = 4;

/** Read track points (or route points) out of a GPX file. */
export function parseGpx(xml: string): Pt[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('That file is not a valid GPX file.');
  const read = (tag: string) =>
    [...doc.getElementsByTagNameNS('*', tag)].map((el) => {
      const ele = el.getElementsByTagNameNS('*', 'ele')[0]?.textContent;
      return { lat: Number(el.getAttribute('lat')), lon: Number(el.getAttribute('lon')), ele: ele ? Number(ele) : undefined };
    });
  const pts = read('trkpt');
  return (pts.length ? pts : read('rtept')).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
}

function km(a: Pt, b: Pt) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Average each point with its neighbors to iron out GPS elevation jitter. */
function smooth(eles: number[], radius = 3) {
  return eles.map((_, i) => {
    const win = eles.slice(Math.max(0, i - radius), i + radius + 1);
    return win.reduce((a, b) => a + b, 0) / win.length;
  });
}

/** Climb in meters, counting only rises that clear the noise threshold. */
function gainM(raw: number[]) {
  const eles = smooth(raw);
  let gain = 0;
  let low = eles[0];
  for (const e of eles) {
    if (e < low) low = e;
    else if (e - low >= GAIN_THRESHOLD_M) {
      gain += e - low;
      low = e;
    }
  }
  return gain;
}

/** Pick up to `n` points spread evenly by distance along the route. */
function sample(pts: Pt[], dist: number[], n: number) {
  if (pts.length <= n) return pts.map((p, i) => ({ p, d: dist[i] }));
  const total = dist[dist.length - 1];
  const out: { p: Pt; d: number }[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (j < dist.length - 1 && dist[j] < target) j++;
    out.push({ p: pts[j], d: dist[j] });
  }
  return out;
}

/** Fill in elevations for points that don't have them, from Open-Meteo's free terrain data. */
async function lookUpElevations(pts: Pt[]): Promise<number[]> {
  const q = (k: 'lat' | 'lon') => pts.map((p) => p[k].toFixed(5)).join(',');
  const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${q('lat')}&longitude=${q('lon')}`);
  if (!res.ok) throw new Error('Elevation lookup failed.');
  const body = (await res.json()) as { elevation?: number[] };
  if (!body.elevation || body.elevation.length !== pts.length) throw new Error('Elevation lookup failed.');
  return body.elevation;
}

/** Turn GPX text into a chartable profile with length and gain. */
export async function shapeFromGpx(xml: string): Promise<Omit<RouteShape, 'source'>> {
  const pts = parseGpx(xml);
  if (pts.length < 2) throw new Error('The GPX file has no route in it.');
  const dist = [0];
  for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + km(pts[i - 1], pts[i]));
  const lengthMi = dist[dist.length - 1] * MI_PER_KM;

  const hasEle = pts.filter((p) => p.ele !== undefined).length >= pts.length * 0.9;
  const picked = sample(pts, dist, MAX_POINTS);
  let eles: number[];
  let gain: number;
  if (hasEle) {
    // Gain from every recorded point; the chart only needs the sample.
    gain = gainM(pts.map((p) => p.ele).filter((e): e is number => e !== undefined));
    eles = picked.map(({ p }) => p.ele ?? NaN);
  } else {
    eles = await lookUpElevations(picked.map(({ p }) => p));
    gain = gainM(eles);
  }
  const profile = picked
    .map(({ d }, i) => [Number((d * MI_PER_KM).toFixed(2)), Math.round(eles[i] * FT_PER_M)] as [number, number])
    .filter(([, ft]) => Number.isFinite(ft));
  return { profile, lengthMi: Number(lengthMi.toFixed(1)), gainFt: Math.round(gain * FT_PER_M) };
}

// One fetch per file per visit, shared by every component that shows the same trail.
const cache = new Map<string, Promise<Omit<RouteShape, 'source'>>>();

function manual(trail: Trail): RouteShape {
  const profile = trail.profile ?? [];
  return {
    profile: profile.length >= 2 ? profile : [],
    lengthMi: trail.lengthMi,
    gainFt: trail.gainFt,
    source: profile.length >= 2 ? 'manual' : 'none',
  };
}

/**
 * A trail's profile, length and gain. An uploaded GPX file wins; otherwise the numbers typed into the CMS;
 * otherwise nothing, and the page hides what it can't show.
 */
export function useRouteShape(trail: Trail | undefined): { shape: RouteShape; loading: boolean } {
  const fallback = trail ? manual(trail) : { profile: [], source: 'none' as const };
  const [state, setState] = useState<{ key?: string; shape?: RouteShape }>({});
  const gpx = trail?.gpx;

  useEffect(() => {
    if (!gpx) return;
    let live = true;
    if (!cache.has(gpx)) {
      const p = fetch(gpx)
        .then((r) => {
          if (!r.ok) throw new Error('GPX file not found.');
          return r.text();
        })
        .then(shapeFromGpx);
      p.catch(() => cache.delete(gpx)); // let a later visit retry
      cache.set(gpx, p);
    }
    cache
      .get(gpx)!
      .then((s) => live && setState({ key: gpx, shape: { ...s, source: 'gpx' } }))
      .catch((err) => {
        console.warn(`Could not read ${gpx}:`, err);
        if (live) setState({ key: gpx });
      });
    return () => {
      live = false;
    };
  }, [gpx]);

  if (!gpx) return { shape: fallback, loading: false };
  if (state.key !== gpx) return { shape: { profile: [], source: 'none' }, loading: true };
  return { shape: state.shape ?? fallback, loading: false };
}
