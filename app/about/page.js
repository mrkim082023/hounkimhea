import Reveal from '../../components/Reveal';
import JourneyTimeline from '../../components/JourneyTimeline';

export const metadata = { title: 'About — Houn Kimhea' };

const achievements = [
  { year: '2026', title: 'OPPOXCSP Smart Phone Photography Contest', detail: '1nd Place Winner' },
  { year: '2025', title: 'Won Fujifilm National Photography Award', detail: '1st Place Winner' },
  { year: '2025', title: 'Won Smart Phone Photography Contest', detail: '3rd Runner Up' },
  { year: '2025', title: "Finished Art Photography — Nimith Art Space", detail: "Art Project: 'Unquieted End'" },
  { year: '2024', title: "Exhibition 'New Wave' — F3 Gallery", detail: 'Phnom Penh, Cambodia' },
  { year: '2024', title: 'Won Oppo Smart Phone Photography Contest', detail: '5th Place' },
  { year: '2024', title: 'Graduate — Nimith Art Space', detail: 'Basic Art Photography' },
  { year: '2024', title: 'Graduate — Professional Institute of Cambodia', detail: 'Short Filmmaking' },
];

const SKILLS = [
  'Wedding & pre-wedding photography',
  'Event & documentary coverage',
  'Cinematic videography',
  'Studio & product photography',
  'Photo & video editing / color grading',
];

export default function AboutPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
        <Reveal>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">About</p>
          <h1 className="font-display text-5xl md:text-6xl mt-3 mb-16 text-bone">
            Houn <span className="gold-text italic">Kimhea</span>
          </h1>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-14">
          <Reveal className="md:col-span-2" delay={0.05}>
            <div className="aspect-[4/5] rounded-sm overflow-hidden relative">
              <img src="/about-me.jpg" alt="Houn Kimhea" className="w-full h-full object-cover" />
            </div>
          </Reveal>

          <Reveal className="md:col-span-3" delay={0.15}>
            <p className="font-display text-2xl md:text-3xl leading-relaxed text-bone/90 mb-8">
              I&apos;m Houn Kimhea, a photographer and filmmaker based in Cambodia, telling
              stories one frame at a time.
            </p>
            <div className="space-y-5 text-bone/60 leading-relaxed text-[15px]">
              <p>
                For me, a camera has never just been a tool &mdash; it&apos;s a way of paying
                attention. I got my start photographing friends&apos; celebrations, and what began
                as a hobby turned into a practice built on patience, timing, and an eye for the
                light that makes an ordinary moment feel unforgettable.
              </p>
              <p>
                Today I split my time between photography and film, moving between weddings,
                corporate events, and quiet documentary work. Whether I&apos;m behind a camera at
                a wedding reception or directing a short brand film, the goal is the same: capture
                something true, not staged.
              </p>
              <p>
                When I&apos;m not shooting, I&apos;m usually editing late into the night, scouting
                new locations, or studying the work of photographers and directors I admire &mdash;
                always looking for the next way to see something familiar differently.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-5">What I do</p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {SKILLS.map((skill) => (
                  <li key={skill} className="flex items-center gap-3 text-bone/70 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <JourneyTimeline items={achievements} />
    </div>
  );
}