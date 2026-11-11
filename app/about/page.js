import { readDb } from '../../lib/db';
import Reveal from '../../components/Reveal';
import JourneyTimeline from '../../components/JourneyTimeline';

export const metadata = { title: 'About — Houn Kimhea' };

export default async function AboutPage() {
  const db = await readDb();
  const { settings } = db;
  const bioParagraphs = settings.aboutBio.split(/\n\s*\n/).filter(Boolean);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
        <Reveal>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">About</p>
          <h1 className="font-display text-5xl md:text-6xl mt-3 mb-16 text-bone">
            Behind the <span className="gold-text italic">lens</span>
          </h1>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-14">
          <Reveal className="md:col-span-2" delay={0.05}>
            <div className="aspect-[4/5] rounded-sm overflow-hidden relative bg-ink-800">
              {settings.aboutPhoto && (
                <img src={settings.aboutPhoto} alt="Houn Kimhea" className="w-full h-full object-cover" />
              )}
            </div>
          </Reveal>

          <Reveal className="md:col-span-3" delay={0.15}>
            <p className="font-display text-2xl md:text-3xl leading-relaxed text-bone/90 mb-8">
              {settings.aboutIntro}
            </p>
            <div className="space-y-5 text-bone/60 leading-relaxed text-[15px]">
              {bioParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {settings.skills.length > 0 && (
              <div className="mt-12">
                <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-5">What I do</p>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {settings.skills.map((skill, i) => (
                    <li key={i} className="flex items-center gap-3 text-bone/70 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {settings.achievements.length > 0 && <JourneyTimeline items={settings.achievements} />}
    </div>
  );
}