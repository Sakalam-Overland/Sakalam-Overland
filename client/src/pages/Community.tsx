import type { JoinInput } from '@shared/types';
import { useState } from 'react';
import { IG_URL, InstagramIcon, PageHero } from '../components/Layout';
import { BoodleFight } from '../components/Food';
import { Photo } from '../components/Photo';
import { Reveal, SectionHead } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { ApiError, api } from '../lib/api';

const glossary = [
  ['Tara na', 'tah-RAH nah', "Let's go. What we yell over the radio when the convoy rolls out."],
  ['Barkada', 'bar-KAH-dah', 'Your crew. The friends you would call to pull you out of a ditch at 2 AM.'],
  ['Bayanihan', 'bah-yah-NEE-hahn', 'The village carrying a house together. On the trail, it means group recovery.'],
  ['Kamayan', 'kah-MAH-yahn', 'Eating with your hands, family style. Utensils are optional at camp.'],
  ['Boodle fight', 'BOO-dul fight', 'A feast laid out on banana leaves. Everyone dives in at once.'],
  ['Kita-kits', 'kee-tah-KEETS', 'See you there. You get this text after you RSVP.'],
  ['Salu-salo', 'sah-LOO sah-LOH', 'A gathering over food. The real reason anyone shows up.'],
  ['Ingat', 'EE-ngat', "Take care. Said at the end of every trip, and we mean it."],
] as const;

const merch = [
  { name: 'Trucker Hat', note: 'Sun-and-stars patch, mesh back', tone: 'dusk' as const },
  { name: 'Crew Hoodie', note: 'Heavyweight, forest green', tone: 'forest' as const },
  { name: 'Trail Tee', note: 'Logo front, Baybayin on the back', tone: 'night' as const },
  { name: 'Custom Hoodie', note: 'Your rig name embroidered', tone: 'dawn' as const },
];

const faq = [
  ['Do I need a lifted truck?', "No. Half our events work for a stock AWD. Each event lists what kind of rig it suits, and the Rig Matcher on the Trails page sorts it out for you."],
  ['Do I have to be Filipino?', "Not at all. We're Filipino-founded and proud of it, but kapwa means everyone's family. Just come hungry."],
  ['What does it cost?', 'Joining is free. You cover your own gas, park fees and permits. Merch sales and raffles pay for group recovery gear.'],
  ['What if I get stuck?', "You will, and that's fine. Every run has a lead rig and a sweep rig with recovery gear, and we teach you as we go."],
];

const interestOptions: { value: JoinInput['interests'][number]; label: string }[] = [
  { value: 'overlanding', label: 'Overlanding' },
  { value: 'rock-crawling', label: 'Rock crawling' },
  { value: 'beach', label: 'Beach runs' },
  { value: 'camping', label: 'Camping' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'salu-salo', label: 'Salu-salo (the food)' },
];

function JoinForm() {
  const [v, setV] = useState<JoinInput>({ name: '', email: '', instagram: '', rig: '', interests: [] });
  const [err, setErr] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'back'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (v.name.trim().length < 2) found.name = 'Tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) found.email = 'Enter a valid email.';
    setErr(found);
    if (Object.keys(found).length) return;
    setState('sending');
    try {
      const res = await api.join(v);
      setState(res.welcome ? 'done' : 'back');
    } catch (error) {
      setState('idle');
      setErr(error instanceof ApiError ? { ...error.fields, form: error.message } : { form: 'Could not reach the server.' });
    }
  }

  if (state === 'done' || state === 'back') {
    return (
      <div className="rounded-3xl bg-deep p-6 text-puti md:p-8" role="status">
        <p className="eyebrow text-dahon">{state === 'done' ? 'Welcome sa barkada' : 'Welcome back'}</p>
        <h3 className="mt-3 text-4xl font-bold">{state === 'done' ? `Salamat, ${v.name.split(' ')[0]}!` : "You're already on the list."}</h3>
        <p className="lead mt-4 text-puti/75">
          Look for an email with the group chat invite and the next ride. In the meantime, follow along on Instagram.
        </p>
        <a href={IG_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6">
          <InstagramIcon className="h-4 w-4" /> Follow @nysakalamoverland
        </a>
      </div>
    );
  }

  const input = (k: 'name' | 'email' | 'instagram' | 'rig', label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="eyebrow text-heading">{label}</span>
      <input
        className="field mt-2"
        value={v[k] ?? ''}
        onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value }))}
        aria-invalid={!!err[k]}
        aria-describedby={err[k] ? `join-${k}-err` : undefined}
        {...props}
      />
      {err[k] && (
        <p id={`join-${k}-err`} className="mt-1.5 text-sm font-normal text-[#b3261e] dark:text-[#f2b8b5]">
          {err[k]}
        </p>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-3xl bg-surface p-5 ring-1 ring-line/10 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {input('name', 'Name', { autoComplete: 'name' })}
        {input('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {input('instagram', 'Instagram', { placeholder: '@yourhandle' })}
        {input('rig', 'Rig', { placeholder: 'What do you drive?' })}
      </div>
      <fieldset>
        <legend className="eyebrow text-heading">I'm into</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {interestOptions.map((o) => {
            const on = v.interests.includes(o.value);
            return (
              <label
                key={o.value}
                className={`cursor-pointer rounded-full border px-4 py-2 font-display text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-araw ${
                  on ? 'border-heading bg-gubat text-puti' : 'border-line/15 hover:border-heading'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() =>
                    setV((s) => ({ ...s, interests: on ? s.interests.filter((x) => x !== o.value) : [...s.interests, o.value] }))
                  }
                />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      {err.form && (
        <p role="alert" className="rounded-xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18] dark:text-[#f2b8b5]">
          {err.form}
        </p>
      )}
      <button type="submit" disabled={state === 'sending'} className="btn-dark w-full justify-center py-4">
        {state === 'sending' ? 'Joining…' : 'Count me in'}
      </button>
      <p className="text-center text-xs text-ink-muted">Free. No spam, just ride invites, about twice a month.</p>
    </form>
  );
}

export default function Community() {
  const { data: rigs } = useAsync(() => api.rigs(), []);

  return (
    <>
      <PageHero scene="community" eyebrow="Community" tagalog="Barkada" icon="community" title={<>Your barkada, now with rigs.</>}>
        Filipino-founded, open to everyone. We're nurses, mechanics, teachers and small business owners who would rather spend Saturday stuck in the
        sand together than alone at home.
      </PageHero>

      {/* Story */}
      <section className="bg-surface py-14 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal className="grid grid-cols-2 gap-4">
            <Photo name="crew-group" alt="The crew lined up in front of their rigs" tone="forest" className="col-span-2 aspect-[16/9] rounded-3xl" />
            <Photo name="crew-food" alt="Boodle fight spread on banana leaves" className="aspect-square rounded-3xl" fallback={<BoodleFight slice />} />
            <Photo name="crew-fire" alt="Members around a campfire" tone="night" className="aspect-square rounded-3xl" />
          </Reveal>
          <div>
            <SectionHead eyebrow="Our story" tagalog="Kwento namin" title="From a group chat to a convoy.">
              <p>
                It started the way most Filipino things start: a group chat, too many photos of food, and someone saying "tara, let's go." A few friends
                with trucks wanted somewhere to take them, and wanted people to go with.
              </p>
              <p className="mt-4">
                The sun and three stars on our logo come from the Philippine flag. The mountains are where we're headed. Everything in between is
                the barkada we've built along the way.
              </p>
            </SectionHead>
          </div>
        </div>
      </section>

      {/* Rigs */}
      <section id="rigs" className="scroll-mt-20 bg-deep py-24 text-puti md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead dark eyebrow="Rig showcase" tagalog="Mga sasakyan" title="Every rig gets a name.">
            Most of them are named after food or family. Tag us on Instagram to get yours featured.
          </SectionHead>
          <div className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:gap-4 lg:grid-cols-3">
            {(rigs ?? []).map((r, i) => (
              <Reveal key={r.nickname} delay={(i % 3) * 80}>
                <article className="group overflow-hidden rounded-3xl bg-puti/5 ring-1 ring-puti/10">
                  <Photo name={r.photo} alt={`${r.owner}'s ${r.vehicle}`} tone={(['dusk', 'forest', 'night'] as const)[i % 3]} className="aspect-[3/2]" />
                  <div className="p-3.5 md:p-5">
                    <p className="font-display text-lg font-extrabold tracking-tight text-dahon md:text-2xl">"{r.nickname}"</p>
                    <p className="mt-0.5 font-display text-xs font-semibold md:text-sm">{r.vehicle}</p>
                    <p className="text-xs text-abo">{r.owner}</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1">
                      {r.mods.map((m) => (
                        <li key={m} className="rounded-full bg-puti/10 px-2 py-0.5 font-display text-[0.65rem] font-semibold">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="relative overflow-hidden bg-gubat py-24 text-puti md:py-32 dark:bg-[#0f2717]">
        <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.04]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead dark eyebrow="Trail Tagalog" tagalog="Matuto tayo" title="Words you'll hear on the radio.">
            No fluency required. By your third ride you'll be saying "tara na" too.
          </SectionHead>
          <dl className="mt-6 grid grid-cols-2 gap-3 md:mt-12 md:gap-4 lg:grid-cols-4">
            {glossary.map(([word, say, meaning], i) => (
              <Reveal key={word} delay={(i % 4) * 60} className="card-raised p-4 md:p-5">
                <dt>
                  <span lang="tl" className="block font-display text-lg font-bold md:text-xl">
                    {word}
                  </span>
                  <span className="text-xs text-dahon-300 italic md:text-sm">{say}</span>
                </dt>
                <dd className="mt-2 text-xs leading-snug text-puti/85 md:text-sm md:leading-relaxed">{meaning}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Merch */}
      <section id="merch" className="scroll-mt-20 bg-surface-2 py-14 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead eyebrow="Merch" tagalog="Pang-porma" title="Wear the sun.">
              Small-batch drops. Every sale funds group recovery gear. DM us on Instagram to order.
            </SectionHead>
            <Reveal>
              <a href={IG_URL} target="_blank" rel="noreferrer" className="btn-dark">
                <InstagramIcon className="h-4 w-4" /> DM to order
              </a>
            </Reveal>
          </div>
          <div className="mt-8 md:mt-14 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {merch.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <div className="group">
                  <div className="relative aspect-square overflow-hidden rounded-2xl md:rounded-3xl">
                    <Photo name={`merch-${m.name.toLowerCase().replace(/\s+/g, '-')}`} alt={m.name} tone={m.tone} className="absolute inset-0" />
                    <img
                      src="/brand/mark-bw.png"
                      alt=""
                      className="absolute inset-0 m-auto w-1/3 rounded-full opacity-90 mix-blend-screen invert transition duration-700 group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-2.5 font-display font-bold text-heading">{m.name}</p>
                  <p className="text-xs text-ink-muted md:text-sm">{m.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Join + FAQ */}
      <section id="join" className="scroll-mt-20 bg-surface py-14 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead eyebrow="Join the crew" tagalog="Sali ka na" title="Get on the list.">
              Ride invites, trail updates and first dibs on merch. Takes 30 seconds.
            </SectionHead>
            <Reveal delay={100} className="mt-8 md:mt-12 space-y-3">
              {faq.map(([q, a]) => (
                <details key={q} className="group rounded-2xl bg-surface-2 px-5 py-4 open:bg-tint">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-heading">
                    {q}
                    <span className="text-xl transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-ink/85">{a}</p>
                </details>
              ))}
            </Reveal>
          </div>
          <Reveal delay={150} className="lg:col-span-7">
            <JoinForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
