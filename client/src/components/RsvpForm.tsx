import type { RsvpInput, TripEvent } from '@shared/types';
import { useState } from 'react';
import { ApiError, api } from '../lib/api';
import { icsFor } from '../lib/format';

type Errors = Partial<Record<keyof RsvpInput | 'form', string>>;

function validate(v: RsvpInput): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Tell us your name.';
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'We need a valid email for trip details.';
  if (v.passengers < 0 || v.passengers > 6) e.passengers = '0–6 passengers.';
  return e;
}

export function RsvpForm({ event, onDone }: { event: TripEvent; onDone: (e: TripEvent) => void }) {
  const [values, setValues] = useState<RsvpInput>({ name: '', email: '', vehicle: '', passengers: 0, experience: 'some' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [waitlisted, setWaitlisted] = useState(false);

  const set = <K extends keyof RsvpInput>(k: K, v: RsvpInput[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('sending');
    try {
      const res = await api.rsvp(event.slug, values);
      setWaitlisted(res.waitlisted);
      setStatus('done');
      onDone(res.event);
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError) setErrors({ ...(err.fields as Errors), form: err.message });
      else setErrors({ form: 'Could not reach the server. Try again in a moment.' });
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-3xl bg-gubat p-8 text-puti" role="status">
        <p className="eyebrow text-dahon">{waitlisted ? 'Nasa waitlist ka' : 'Kita-kits!'}</p>
        <h3 className="mt-3 text-3xl font-bold">{waitlisted ? "You're on the waitlist." : "You're in. See you there."}</h3>
        <p className="lead mt-3 text-puti/75">
          {waitlisted
            ? "We'll email you if a spot opens up. People drop out more often than you'd think."
            : `Meet at ${event.meetTime}. We'll send the convoy channel and final details to ${values.email} the week before.`}
        </p>
        <a href={icsFor(event)} download={`${event.slug}.ics`} className="btn-primary mt-6">
          Add to calendar
        </a>
      </div>
    );
  }

  const full = event.rsvps >= event.capacity;
  const fieldErr = (k: keyof Errors) =>
    errors[k] && (
      <p id={`${k}-err`} className="mt-1.5 text-sm font-normal text-[#b3261e] dark:text-[#f2b8b5]">
        {errors[k]}
      </p>
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow text-heading">Name</span>
          <input
            className="field mt-2"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-err' : undefined}
          />
          {fieldErr('name')}
        </label>
        <label className="block">
          <span className="eyebrow text-heading">Email</span>
          <input
            className="field mt-2"
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-err' : undefined}
          />
          {fieldErr('email')}
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <label className="block">
          <span className="eyebrow text-heading">Rig</span>
          <input className="field mt-2" placeholder="e.g. '19 4Runner, 33s, no lockers" value={values.vehicle} onChange={(e) => set('vehicle', e.target.value)} />
        </label>
        <label className="block">
          <span className="eyebrow text-heading">Passengers</span>
          <input
            className="field mt-2"
            type="number"
            min={0}
            max={6}
            value={values.passengers}
            onChange={(e) => set('passengers', Number(e.target.value))}
            aria-invalid={!!errors.passengers}
          />
          {fieldErr('passengers')}
        </label>
      </div>
      <fieldset>
        <legend className="eyebrow text-heading">Trail experience</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ['first-timer', 'First time'],
              ['some', 'A few trips'],
              ['seasoned', 'Seasoned'],
            ] as const
          ).map(([v, label]) => (
            <label
              key={v}
              className={`cursor-pointer rounded-xl border px-3 py-3 text-center font-display text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-araw ${
                values.experience === v ? 'border-heading bg-gubat text-puti' : 'border-line/15 hover:border-heading'
              }`}
            >
              <input type="radio" name="experience" value={v} checked={values.experience === v} onChange={() => set('experience', v)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-muted">First-timers get paired with a lead rig. Nobody gets left behind.</p>
      </fieldset>
      {errors.form && (
        <p className="rounded-xl bg-[#b3261e]/10 px-4 py-3 text-sm font-normal text-[#8c1d18] dark:text-[#f2b8b5]" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" className="btn-dark w-full justify-center py-4" disabled={status === 'sending'}>
        {status === 'sending' ? 'Saving your spot…' : full ? 'Join the waitlist' : 'Reserve my spot'}
      </button>
    </form>
  );
}
