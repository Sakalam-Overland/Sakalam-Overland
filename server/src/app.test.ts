import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from './app.ts';
import { MemoryStore } from './store.ts';

let app: ReturnType<typeof createApp>;
beforeEach(() => {
  app = createApp(new MemoryStore());
});

const rsvp = { name: 'Caden', email: 'caden@example.com', passengers: 1, experience: 'some' };

describe('events', () => {
  it('lists events sorted by start date', async () => {
    const res = await request(app).get('/api/events').expect(200);
    const starts = res.body.map((e: { start: string }) => e.start);
    assert.deepEqual(starts, [...starts].sort());
  });

  it('filters by kind', async () => {
    const res = await request(app).get('/api/events?kind=hike').expect(200);
    assert.ok(res.body.length > 0);
    assert.ok(res.body.every((e: { kind: string }) => e.kind === 'hike'));
  });

  it('404s an unknown event', async () => {
    await request(app).get('/api/events/nope').expect(404);
  });
});

describe('rsvp', () => {
  it('claims a seat and rejects a duplicate email', async () => {
    const first = await request(app).post('/api/events/pine-barrens-sand-run/rsvp').send(rsvp).expect(201);
    assert.equal(first.body.waitlisted, false);
    assert.equal(first.body.event.rsvps, 7);
    await request(app).post('/api/events/pine-barrens-sand-run/rsvp').send({ ...rsvp, email: 'CADEN@example.com' }).expect(409);
  });

  it('waitlists when the event is full', async () => {
    const res = await request(app).post('/api/events/rausch-creek-trail-day/rsvp').send(rsvp).expect(201);
    assert.equal(res.body.waitlisted, true);
    assert.equal(res.body.event.rsvps, 12);
  });

  it('returns field errors for bad input', async () => {
    const res = await request(app).post('/api/events/recovery-101/rsvp').send({ name: 'C', email: 'x' }).expect(422);
    assert.ok(res.body.fields.name);
    assert.ok(res.body.fields.email);
    assert.ok(res.body.fields.experience);
  });
});

describe('members', () => {
  it('welcomes a new member once', async () => {
    const body = { name: 'Caden', email: 'caden@example.com', interests: ['overlanding'] };
    assert.equal((await request(app).post('/api/members').send(body).expect(201)).body.welcome, true);
    assert.equal((await request(app).post('/api/members').send(body).expect(200)).body.welcome, false);
  });
});

describe('trails', () => {
  it('filters by difficulty', async () => {
    const res = await request(app).get('/api/trails?difficulty=easy').expect(200);
    assert.ok(res.body.every((t: { difficulty: string }) => t.difficulty === 'easy'));
  });
});
