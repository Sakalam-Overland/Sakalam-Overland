import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import type { Store } from './store.ts';

const rsvpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  vehicle: z.string().trim().max(120).optional(),
  passengers: z.coerce.number().int().min(0).max(6).default(0),
  experience: z.enum(['first-timer', 'some', 'seasoned']),
});

const joinSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  instagram: z.string().trim().regex(/^@?[\w.]{1,30}$/, 'Invalid handle').optional().or(z.literal('')),
  rig: z.string().trim().max(120).optional(),
  interests: z.array(z.enum(['overlanding', 'hiking', 'camping', 'rock-crawling', 'beach', 'salu-salo'])).max(6).default([]),
});

const issues = (err: z.ZodError) =>
  Object.fromEntries(err.issues.map((i) => [i.path.join('.') || 'form', i.message]));

export function createApp(store: Store, { clientOrigin = process.env.CLIENT_ORIGIN } = {}) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: clientOrigin ?? true }));
  app.use(express.json({ limit: '20kb' }));

  const writes = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, store: store.kind });
  });

  app.get('/api/events', async (req, res) => {
    let list = await store.listEvents();
    const { kind, region, upcoming } = req.query;
    if (typeof kind === 'string') list = list.filter((e) => e.kind === kind);
    if (typeof region === 'string') list = list.filter((e) => e.region.toLowerCase() === region.toLowerCase());
    if (upcoming === 'true') {
      const today = new Date().toISOString().slice(0, 10);
      list = list.filter((e) => e.end >= today);
    }
    res.json(list);
  });

  app.get('/api/events/:slug', async (req, res) => {
    const event = await store.getEvent(String(req.params.slug));
    if (!event) return void res.status(404).json({ error: 'Event not found' });
    res.json(event);
  });

  app.post('/api/events/:slug/rsvp', writes, async (req, res) => {
    const parsed = rsvpSchema.safeParse(req.body);
    if (!parsed.success) return void res.status(422).json({ error: 'Validation failed', fields: issues(parsed.error) });
    const result = await store.rsvp(String(req.params.slug), parsed.data);
    if (!result.ok) {
      return void (result.reason === 'not-found'
        ? res.status(404).json({ error: 'Event not found' })
        : res.status(409).json({ error: "You're already on the list for this one." }));
    }
    res.status(201).json({ event: result.event, waitlisted: result.waitlisted });
  });

  app.get('/api/trails', async (req, res) => {
    let list = await store.listTrails();
    const { difficulty, type } = req.query;
    if (typeof difficulty === 'string') list = list.filter((t) => t.difficulty === difficulty);
    if (typeof type === 'string') list = list.filter((t) => t.type === type);
    res.json(list);
  });

  app.get('/api/trails/:slug', async (req, res) => {
    const trail = await store.getTrail(String(req.params.slug));
    if (!trail) return void res.status(404).json({ error: 'Trail not found' });
    res.json(trail);
  });

  app.get('/api/campsites', async (_req, res) => {
    res.json(await store.listCampsites());
  });

  app.get('/api/rigs', async (_req, res) => {
    res.json(await store.listRigs());
  });

  app.post('/api/members', writes, async (req, res) => {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) return void res.status(422).json({ error: 'Validation failed', fields: issues(parsed.error) });
    const { duplicate } = await store.join(parsed.data);
    res.status(duplicate ? 200 : 201).json({ welcome: !duplicate });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our end.' });
  });

  return app;
}
