import type { JoinInput } from '@shared/types';
import { useState } from 'react';
import { IG_URL, InstagramIcon, PageHero } from '../components/Layout';
import { faq, glossary, merch, settings } from '@shared/data';
import { BoodleFight } from '../components/Food';
import { Photo } from '../components/Photo';
import { Reveal, SectionHead } from '../components/Reveal';
import { useAsync } from '../hooks/useAsync';
import { ApiError, api } from '../lib/api';

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
    <label className={`block ${k === 'name' || k === 'email' ? 'col-span-2 sm:col-span-1' : ''}`}>
      <span className="eyebrow text-heading">{label}</span>
      <input
        className="field mt-1.5 py-2.5 md:mt-2 md:py-3"
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
    <form onSubmit={submit} noValidate className="space-y-3.5 rounded-3xl bg-surface px-4 py-4 ring-1 ring-line/10 md:space-y-4 md:px-8 md:py-6">
      <div className="grid grid-cols-2 gap-3 md:gap-5">
        {input('name', 'Name', { autoComplete: 'name', placeholder: 'Your name' })}
        {input('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'name@example.com' })}
        {input('instagram', 'Instagram', { placeholder: '@yourhandle' })}
        {input('rig', 'Rig', { placeholder: 'What do you drive?' })}
      </div>
      <fieldset>
        <legend className="eyebrow text-heading">I'm into</legend>
        <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
          {interestOptions.map((o) => {
            const on = v.interests.includes(o.value);
            return (
              <label
                key={o.value}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-display text-xs font-semibold transition md:px-4 md:py-2 md:text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-araw ${
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
      <button type="submit" disabled={state === 'sending'} className="btn-dark w-full justify-center py-3 md:py-4">
        {state === 'sending' ? 'Joining…' : 'Count me in'}
      </button>
      <p className="text-center text-xs text-ink-muted">Free. No spam, just ride invites, about twice a month.</p>
    </form>
  );
}

/** Phones only: says the row above it scrolls sideways. */
function SwipeHint({ dark = false }: { dark?: boolean }) {
  return (
    <p aria-hidden data-no-reveal className={`mt-2 flex items-center justify-end gap-1.5 font-display text-xs font-semibold md:hidden ${dark ? 'text-abo' : 'text-ink-muted'}`}>
      Swipe for more
      <span className="inline-block animate-[nudge_1.6s_ease-in-out_infinite] motion-reduce:animate-none">→</span>
    </p>
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
      {/* Laptops: the photos take whatever height is left under the 360px page header and this section's padding, within limits. */}
      <section className="bg-surface py-8 md:py-12 lg:py-8">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 md:items-center md:gap-8 md:px-8 lg:gap-12">
          <Reveal className="grid grid-cols-2 gap-2 md:gap-3 lg:h-[clamp(390px,calc(100svh-424px),480px)] lg:grid-rows-[3fr_2fr]">
            <Photo name="crew-group" src={settings.crewPhoto} alt="The crew lined up in front of their rigs" tone="forest" className="col-span-2 aspect-[5/2] rounded-2xl md:aspect-[2/1] md:rounded-3xl lg:aspect-auto" />
            <Photo name="crew-food" src={settings.foodPhoto} alt="Boodle fight spread on banana leaves" className="aspect-[2/1] rounded-2xl short:hidden md:aspect-[3/2] md:rounded-3xl lg:aspect-auto" fallback={<BoodleFight slice />} />
            <Photo name="crew-fire" src={settings.campfirePhoto} alt="Members around a campfire" tone="night" className="aspect-[2/1] rounded-2xl short:hidden md:aspect-[3/2] md:rounded-3xl lg:aspect-auto" />
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
      <section id="rigs" className="scroll-mt-16 bg-deep py-8 text-puti md:py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead dark eyebrow="Rig showcase" tagalog="Mga sasakyan" title="Every rig gets a name.">
            Most of them are named after food or family. Tag us on Instagram to get yours featured.
          </SectionHead>
          {/* Phones: one swipeable row. Larger screens: a grid of cards with the photo beside the details. */}
          <div
            role="region"
            aria-label="Member rigs, swipe for more"
            className="no-scrollbar -mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pb-1 md:mx-0 md:mt-6 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3"
          >
            {(rigs ?? []).map((r, i) => (
              <div key={r.nickname} data-no-reveal className="flex w-[62%] max-w-[280px] shrink-0 snap-start md:w-auto md:max-w-none">
                <article className="group flex w-full flex-col overflow-hidden rounded-2xl bg-puti/5 ring-1 ring-puti/10 md:flex-row md:rounded-3xl">
                  <Photo name={`rig-${r.nickname.toLowerCase().replace(/\W+/g, '-')}`} src={r.image} alt={`${r.owner}'s ${r.vehicle}`} tone={(['dusk', 'forest', 'night'] as const)[i % 3]} className="aspect-[2/1] shrink-0 md:aspect-auto md:w-2/5" />
                  <div className="min-w-0 p-3.5 md:p-4">
                    <p className="font-display text-lg font-extrabold tracking-tight text-dahon md:text-xl">"{r.nickname}"</p>
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
              </div>
            ))}
          </div>
          <SwipeHint dark />
        </div>
      </section>

      {/* Glossary */}
      <section className="relative overflow-hidden bg-gubat py-8 text-puti short:py-6 md:py-12 dark:bg-[#0f2717]">
        <div className="banig pointer-events-none absolute inset-0 text-puti opacity-[0.04]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead dark eyebrow="Trail Tagalog" tagalog="Matuto tayo" title="Words you'll hear on the radio.">
            No fluency required. By your third ride you'll be saying "tara na" too.
          </SectionHead>
          {/* Phones: two swipeable rows. Larger screens: a plain grid. */}
          <dl className="no-scrollbar -mx-5 mt-4 grid auto-cols-[46%] grid-flow-col grid-rows-2 snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pb-1 md:mx-0 md:mt-6 md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:grid-rows-none md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
            {glossary.map(({ word, say, meaning }) => (
              <div key={word} data-no-reveal className="card-raised snap-start p-3.5 md:p-5">
                <dt>
                  <span lang="tl" className="block font-display text-lg font-bold md:text-xl">
                    {word}
                  </span>
                  <span className="text-xs text-dahon-300 italic md:text-sm">{say}</span>
                </dt>
                <dd className="mt-2 text-xs leading-snug text-puti/85 md:text-sm md:leading-relaxed">{meaning}</dd>
              </div>
            ))}
          </dl>
          <SwipeHint dark />
        </div>
      </section>

      {/* Merch */}
      <section id="merch" className="scroll-mt-16 bg-surface-2 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end md:gap-6">
            <SectionHead eyebrow="Merch" tagalog="Pang-porma" title="Wear the sun.">
              Small-batch drops. Every sale funds group recovery gear. DM us on Instagram to order.
            </SectionHead>
            <Reveal className="shrink-0">
              <a href={IG_URL} target="_blank" rel="noreferrer" className="btn-dark">
                <InstagramIcon className="h-4 w-4" /> DM to order
              </a>
            </Reveal>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:gap-4">
            {merch.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <div className="group">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl short:aspect-[5/2] md:aspect-square md:rounded-3xl lg:aspect-[4/3]">
                    <Photo name={`merch-${m.name.toLowerCase().replace(/\s+/g, '-')}`} src={m.image} alt={m.name} tone={(['dusk', 'forest', 'night', 'dawn'] as const)[i % 4]} className="h-full" />
                    {!m.image && (
                    <img
                      src="/brand/mark-bw.png"
                      alt=""
                      className="absolute inset-0 m-auto w-1/3 rounded-full opacity-90 mix-blend-screen invert transition duration-700 group-hover:scale-110"
                    />
                    )}
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
      <section id="join" className="scroll-mt-16 bg-surface py-8 md:py-12">
        {/* Phones: heading, form, then FAQ. Larger screens: heading and FAQ on the left, form bottom-aligned on the right. */}
        <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-12 md:gap-x-6 md:gap-y-6 md:px-8 lg:gap-x-14">
          <div className="md:col-span-5">
            <SectionHead eyebrow="Join the crew" tagalog="Sali ka na" title="Get on the list." className="[&>div]:short:hidden">
              Ride invites, trail updates and first dibs on merch. Takes 30 seconds.
            </SectionHead>
          </div>
          <Reveal delay={150} className="md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:self-end">
            <JoinForm />
          </Reveal>
          <div className="md:col-span-5 md:row-start-2">
            <p className="eyebrow mb-2 text-heading md:hidden">Questions</p>
            <Reveal delay={100} className="space-y-2 md:space-y-3">
              {faq.map(({ question: q, answer: a }) => (
                <details key={q} className="group rounded-2xl bg-surface-2 px-4 py-3 open:bg-tint md:px-5 md:py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-semibold text-heading md:text-base">
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
        </div>
      </section>
    </>
  );
}
