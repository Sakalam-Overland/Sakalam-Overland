import { PageHero } from '../components/Layout';
import { Reveal, SectionHead } from '../components/Reveal';
import { LogoMark } from '../components/SunMark';

const palette = [
  { token: 'puti', name: 'Puti · White', hex: '#FFFFFF', rgb: '255, 255, 255', use: 'Surfaces, type on dark' },
  { token: 'dahon', name: 'Dahon · Leaf', hex: '#61AB73', rgb: '97, 171, 115', use: 'Sub-headings, actions, data' },
  { token: 'gubat', name: 'Gubat · Forest', hex: '#183B22', rgb: '24, 59, 34', use: 'Headings, primary brand surface' },
  { token: 'uling', name: 'Uling · Charcoal', hex: '#272928', rgb: '39, 41, 40', use: 'Body text, cards on black' },
  { token: 'itim', name: 'Itim · Black', hex: '#000000', rgb: '0, 0, 0', use: 'Hero, nav, footer' },
  { token: 'araw', name: 'Araw · Sun', hex: '#F6B81A', rgb: '246, 184, 26', use: 'Accent only: sun, focus, alerts' },
];

const icons = ['home', 'events', 'trails', 'campsites', 'community'];

export default function Brand() {
  return (
    <>
      <PageHero scene="brand" eyebrow="Brand guide" tagalog="Gabay" icon="home" title={<>The system behind the sun.</>}>
        The palette, type, marks and icons that run the site, written as Tailwind theme tokens so the design and the code stay in sync.
      </PageHero>

      <section className="bg-surface py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead eyebrow="Color" title="Forest first, sun as accent." />
          <div className="mt-8 md:mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {palette.map((c, i) => (
              <Reveal key={c.token} delay={(i % 3) * 60}>
                <div className="overflow-hidden rounded-3xl ring-1 ring-line/10">
                  <div className="h-24" style={{ background: c.hex }} />
                  <div className="p-4">
                    <p className="font-display text-lg font-bold text-heading">{c.hex}</p>
                    <p className="text-sm text-ink-muted">RGB {c.rgb}</p>
                    <p className="mt-3 font-display text-sm font-semibold">{c.name}</p>
                    <p className="text-sm text-ink-muted">{c.use}</p>
                    <code className="mt-3 inline-block rounded bg-surface-2 px-2 py-1 text-xs">--color-{c.token}</code>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-sm text-ink-muted">
            Token names are Tagalog: <em>puti</em> (white), <em>dahon</em> (leaf), <em>gubat</em> (forest), <em>uling</em> (charcoal), <em>itim</em>{' '}
            (black), <em>araw</em> (sun). Araw comes from the color logo and is used about as often as the flag uses it.
          </p>
        </div>
      </section>

      <section className="bg-surface-2 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Type" title="Montserrat + Outfit." />
            <div className="mt-10 space-y-8">
              <div>
                <p className="eyebrow text-ink-muted">Heading · Montserrat Bold</p>
                <p className="mt-2 font-display text-5xl font-bold text-heading">Sakalam Overland</p>
              </div>
              <div>
                <p className="eyebrow text-ink-muted">Sub-heading · Montserrat SemiBold</p>
                <p className="mt-2 font-display text-3xl font-semibold text-dahon">Upcoming Events</p>
              </div>
              <div>
                <p className="eyebrow text-ink-muted">Body · Outfit Extra Light</p>
                <p className="lead mt-2">Join a community of off-road enthusiasts! Find new trails.</p>
              </div>
              <div>
                <p className="eyebrow text-ink-muted">Accent · Noto Sans Tagalog (Baybayin)</p>
                <p lang="tl" className="mt-2 font-baybayin text-5xl text-heading">ᜐᜃᜎᜋ᜔</p>
              </div>
            </div>
          </div>
          <div>
            <SectionHead eyebrow="Marks" title="Three ways to sign it." />
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="col-span-2 grid place-items-center rounded-3xl bg-itim p-6">
                <img src="/brand/logo-color.png" alt="Full color logo" className="w-64" />
              </div>
              <div className="grid place-items-center rounded-3xl bg-white p-6">
                <img src="/brand/logo-bw.png" alt="Black and white logo" className="w-40" />
              </div>
              <div className="grid place-items-center rounded-3xl bg-gubat p-6">
                <LogoMark className="w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead eyebrow="Icons" title="One icon per section of the site.">
            Each section has a filled icon for dark surfaces and a black-and-white one for print and light surfaces.
          </SectionHead>
          <div className="mt-8 md:mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {icons.map((ic) => (
              <div key={ic} className="flex flex-col items-center gap-4 rounded-3xl bg-surface-2 p-4">
                <div className="flex gap-3">
                  <img src={`/icons/${ic}.png`} alt="" className="h-14 w-14" />
                  <img src={`/icons/${ic}-bw.png`} alt="" className="h-14 w-14" />
                </div>
                <p className="font-display text-sm font-semibold capitalize text-heading">{ic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-deep py-20 text-puti md:py-20">
        <div className="banig absolute inset-0 text-dahon opacity-[0.08]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead dark eyebrow="Pattern" title="Banig weave.">
            A low-contrast diagonal weave based on the woven palm mats found in Filipino homes. It's pure CSS gradients and sits behind dark and
            forest sections at 4 to 8 percent opacity.
          </SectionHead>
        </div>
      </section>
    </>
  );
}
