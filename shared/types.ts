export type Difficulty = 'easy' | 'moderate' | 'difficult' | 'extreme';

export type EventKind = 'group-ride' | 'campout' | 'hike' | 'meetup' | 'salu-salo';

export interface TripEvent {
  slug: string;
  title: string;
  kind: EventKind;
  /** ISO date (local, no time zone) of the first day */
  start: string;
  /** ISO date of the last day; same as start for single-day events */
  end: string;
  meetTime: string;
  location: string;
  region: string;
  difficulty: Difficulty;
  capacity: number;
  rsvps: number;
  summary: string;
  bring: string[];
  trailSlug?: string;
  campsiteSlug?: string;
  /** Uploaded photo; without it the event borrows its campsite's photo. */
  image?: string;
}

export type TrailStatus = 'open' | 'caution' | 'closed' | 'seasonal';

export interface Trail {
  slug: string;
  name: string;
  region: string;
  state: 'NY' | 'NJ' | 'PA';
  type: 'offroad' | 'hike' | 'beach';
  difficulty: Difficulty;
  status: TrailStatus;
  statusNote: string;
  lengthMi: number;
  gainFt: number;
  driveFromNYC: string;
  permit: string;
  season: string;
  coords: [number, number];
  summary: string;
  gear: string[];
  /** [mile, elevation in ft] pairs along the route */
  profile: [number, number][];
  lastVerified: string;
}

export interface Campsite {
  slug: string;
  name: string;
  region: string;
  state: 'NY' | 'NJ' | 'PA';
  access: '2WD' | 'AWD' | '4x4' | 'Hike-in';
  sites: string;
  fee: string;
  season: string;
  coords: [number, number];
  amenities: string[];
  summary: string;
  nearbyTrail?: string;
  /** Uploaded photo path, e.g. /photos/godfrey.jpg. Empty shows the drawn placeholder. */
  image?: string;
}

export interface Rig {
  owner: string;
  vehicle: string;
  nickname: string;
  mods: string[];
  image?: string;
}

export interface MerchItem {
  name: string;
  note: string;
  image?: string;
}

export interface GlossaryItem {
  word: string;
  say: string;
  meaning: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GalleryItem {
  caption: string;
  alt: string;
  image?: string;
}

export interface SiteSettings {
  instagramFollowers: string;
  statesRidden: string;
  heroPhoto: string;
  heroPhotoCaption: string;
  crewPhoto: string;
  foodPhoto: string;
  campfirePhoto: string;
}

export interface RsvpInput {
  name: string;
  email: string;
  vehicle?: string;
  passengers: number;
  experience: 'first-timer' | 'some' | 'seasoned';
}

export interface JoinInput {
  name: string;
  email: string;
  instagram?: string;
  rig?: string;
  interests: string[];
}
