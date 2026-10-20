import mongoose, { Schema } from 'mongoose';
import { campsites, events, rigs, trails } from '../../shared/data.ts';
import type { Campsite, JoinInput, Rig, RsvpInput, Trail, TripEvent } from '../../shared/types.ts';

export type RsvpResult = { ok: true; event: TripEvent; waitlisted: boolean } | { ok: false; reason: 'not-found' | 'duplicate' };

export interface Store {
  readonly kind: 'memory' | 'mongo';
  listEvents(): Promise<TripEvent[]>;
  getEvent(slug: string): Promise<TripEvent | null>;
  rsvp(slug: string, input: RsvpInput): Promise<RsvpResult>;
  listTrails(): Promise<Trail[]>;
  getTrail(slug: string): Promise<Trail | null>;
  listCampsites(): Promise<Campsite[]>;
  listRigs(): Promise<Rig[]>;
  join(input: JoinInput): Promise<{ ok: boolean; duplicate: boolean }>;
}

const byStart = (a: TripEvent, b: TripEvent) => a.start.localeCompare(b.start);

/** Zero-dependency store used in dev and on static hosts; resets on restart. */
export class MemoryStore implements Store {
  readonly kind = 'memory';
  private events = structuredClone(events);
  private rsvps = new Map<string, Set<string>>();
  private members = new Set<string>();

  async listEvents() { return [...this.events].sort(byStart); }
  async getEvent(slug: string) { return this.events.find((e) => e.slug === slug) ?? null; }

  async rsvp(slug: string, input: RsvpInput): Promise<RsvpResult> {
    const event = this.events.find((e) => e.slug === slug);
    if (!event) return { ok: false, reason: 'not-found' };
    const emails = this.rsvps.get(slug) ?? new Set();
    const email = input.email.toLowerCase();
    if (emails.has(email)) return { ok: false, reason: 'duplicate' };
    emails.add(email);
    this.rsvps.set(slug, emails);
    const waitlisted = event.rsvps >= event.capacity;
    if (!waitlisted) event.rsvps += 1;
    return { ok: true, event, waitlisted };
  }

  async listTrails() { return trails; }
  async getTrail(slug: string) { return trails.find((t) => t.slug === slug) ?? null; }
  async listCampsites() { return campsites; }
  async listRigs() { return rigs; }

  async join(input: JoinInput) {
    const email = input.email.toLowerCase();
    const duplicate = this.members.has(email);
    this.members.add(email);
    return { ok: true, duplicate };
  }
}

// --- Mongo -----------------------------------------------------------------

const noId = { versionKey: false } as const;

const EventModel = mongoose.model('Event', new Schema<TripEvent>({
  slug: { type: String, unique: true, index: true },
  title: String, kind: String, start: String, end: String, meetTime: String,
  location: String, region: String, difficulty: String,
  capacity: Number, rsvps: Number, summary: String, bring: [String],
  trailSlug: String, campsiteSlug: String,
}, noId));

const TrailModel = mongoose.model('Trail', new Schema<Trail>({
  slug: { type: String, unique: true }, name: String, region: String, state: String, type: String,
  difficulty: String, status: String, statusNote: String, lengthMi: Number, gainFt: Number,
  driveFromNYC: String, permit: String, season: String, coords: [Number], summary: String,
  gear: [String], profile: [[Number]], lastVerified: String,
}, noId));

const CampsiteModel = mongoose.model('Campsite', new Schema<Campsite>({
  slug: { type: String, unique: true }, name: String, region: String, state: String, access: String,
  sites: String, fee: String, season: String, coords: [Number], amenities: [String],
  summary: String, nearbyTrail: String,
}, noId));

const RigModel = mongoose.model('Rig', new Schema<Rig>({
  owner: String, vehicle: String, nickname: String, mods: [String], image: String,
}, noId));

const RsvpModel = mongoose.model('Rsvp', new Schema({
  eventSlug: { type: String, index: true },
  name: String, email: { type: String, lowercase: true }, vehicle: String,
  passengers: Number, experience: String, waitlisted: Boolean,
}, { timestamps: true }).index({ eventSlug: 1, email: 1 }, { unique: true }));

const MemberModel = mongoose.model('Member', new Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  instagram: String, rig: String, interests: [String],
}, { timestamps: true }));

const isDuplicateKey = (err: unknown) => (err as { code?: number })?.code === 11000;
const lean = { _id: 0, __v: 0 } as const;

export class MongoStore implements Store {
  readonly kind = 'mongo';

  async listEvents() { return EventModel.find({}, lean).sort({ start: 1 }).lean<TripEvent[]>(); }
  async getEvent(slug: string) { return EventModel.findOne({ slug }, lean).lean<TripEvent>(); }

  async rsvp(slug: string, input: RsvpInput): Promise<RsvpResult> {
    const event = await EventModel.findOne({ slug }, lean).lean<TripEvent>();
    if (!event) return { ok: false, reason: 'not-found' };
    // Claim a seat atomically so two RSVPs can't both take the last spot.
    const updated = await EventModel.findOneAndUpdate(
      { slug, $expr: { $lt: ['$rsvps', '$capacity'] } },
      { $inc: { rsvps: 1 } },
      { new: true, projection: lean },
    ).lean<TripEvent>();
    const waitlisted = !updated;
    try {
      await RsvpModel.create({ eventSlug: slug, ...input, waitlisted });
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      if (updated) await EventModel.updateOne({ slug }, { $inc: { rsvps: -1 } });
      return { ok: false, reason: 'duplicate' };
    }
    return { ok: true, event: updated ?? event, waitlisted };
  }

  async listTrails() { return TrailModel.find({}, lean).lean<Trail[]>(); }
  async getTrail(slug: string) { return TrailModel.findOne({ slug }, lean).lean<Trail>(); }
  async listCampsites() { return CampsiteModel.find({}, lean).lean<Campsite[]>(); }
  async listRigs() { return RigModel.find({}, lean).lean<Rig[]>(); }

  async join(input: JoinInput) {
    try {
      await MemberModel.create(input);
      return { ok: true, duplicate: false };
    } catch (err) {
      if (isDuplicateKey(err)) return { ok: true, duplicate: true };
      throw err;
    }
  }

  /** Replace catalog collections with the shared seed data. RSVPs and members are kept. */
  static async seed() {
    await Promise.all([EventModel.deleteMany({}), TrailModel.deleteMany({}), CampsiteModel.deleteMany({}), RigModel.deleteMany({})]);
    await Promise.all([
      EventModel.insertMany(events),
      TrailModel.insertMany(trails),
      CampsiteModel.insertMany(campsites),
      RigModel.insertMany(rigs),
    ]);
  }
}

export async function createStore(uri = process.env.MONGODB_URI): Promise<Store> {
  if (!uri) return new MemoryStore();
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    if ((await EventModel.estimatedDocumentCount()) === 0) await MongoStore.seed();
    return new MongoStore();
  } catch (err) {
    console.warn(`[store] MongoDB unavailable (${(err as Error).message}). Falling back to memory.`);
    return new MemoryStore();
  }
}
