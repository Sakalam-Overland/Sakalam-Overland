// All frequently edited content lives in /content as JSON, edited through the CMS at /admin.
// This module is the one place the app reads it from, and it adapts CMS-friendly shapes back to app types.
import campsiteFile from '../content/campsites.json' with { type: 'json' };
import eventFile from '../content/events.json' with { type: 'json' };
import faqFile from '../content/faq.json' with { type: 'json' };
import galleryFile from '../content/gallery.json' with { type: 'json' };
import glossaryFile from '../content/glossary.json' with { type: 'json' };
import merchFile from '../content/merch.json' with { type: 'json' };
import rigFile from '../content/rigs.json' with { type: 'json' };
import settingsFile from '../content/settings.json' with { type: 'json' };
import trailFile from '../content/trails.json' with { type: 'json' };
import type { Campsite, FaqItem, GalleryItem, GlossaryItem, MerchItem, Rig, SiteSettings, Trail, TripEvent } from './types.ts';

export const events = eventFile.items as TripEvent[];
export const campsites = campsiteFile.items as Campsite[];
export const rigs = rigFile.items as Rig[];
export const merch = merchFile.items as MerchItem[];
export const glossary = glossaryFile.items as GlossaryItem[];
export const faq = faqFile.items as FaqItem[];
export const gallery = galleryFile.items as GalleryItem[];
export const settings = settingsFile as SiteSettings;

// The CMS stores elevation points as { mile, ft } rows; the chart wants [mile, ft] pairs.
export const trails = trailFile.items.map((t) => ({
  ...t,
  profile: t.profile.map((p) => [p.mile, p.ft] as [number, number]),
})) as Trail[];

export const kindLabels: Record<TripEvent['kind'], string> = {
  'group-ride': 'Group Ride',
  campout: 'Campout',
  hike: 'Hike',
  meetup: 'Meetup',
  'salu-salo': 'Salu-Salo',
};
