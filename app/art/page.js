import Link from 'next/link';
import { getSiteData } from '../../lib/db';
import Reveal from '../../components/Reveal';
import FadeImage from '../../components/FadeImage';

export const metadata = { title: 'Contemporary Art — Houn Kimhea' };

const paragraphs = (text = '') => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export default async function ArtPage() {
  const db = await getSiteData();
  const { art } = db;
  const projects = art.projects || [];

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 md:px-10 pt-28 md:pt-36 pb-20">
        <Reveal>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Contemporary Art</p>
          <h1 className="font-display text-5xl md:text-8xl mt-3 text-bone leading-[0.95]">
            {art.heading || 'Art'} <span className="gold-text italic">practice</span>
          </h1>
          {art.intro && <p className="mt-8 max-w-2xl text-bone/60 text-lg leading-relaxed">{art.intro}</p>}
        </Reveal>
      </section>

      {art.statement && (
        <section className="hairline border-t border-ink-700 bg-ink-900/40">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-[220px_1fr] gap-10">
            <Reveal>
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400 md:sticky md:top-28">Artist statement</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-6">
                {paragraphs(art.statement).map((p, i) => (
                  <p key={i} className={i === 0 ? 'font-display text-2xl md:text-3xl leading-relaxed text-bone/90' : 'text-bone/60 leading-relaxed text-[16px]'}>
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
        <Reveal>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-12">Projects &amp; works</p>
        </Reveal>
        {projects.length === 0 ? (
          <p className="font-display text-2xl text-bone/40 py-10">Works coming soon.</p>
        ) : (
          <div className="space-y-24 md:space-y-36">
            {projects.map((project, i) => {
              const cover = project.photos?.[0]?.url;
              const flip = i % 2 === 1;
              return (
                <Reveal key={project.id}>
                  <Link href={`/art/${project.id}`} className="group grid md:grid-cols-12 gap-8 md:gap-12 items-center">
                    <div className={`md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
                      {cover ? (
                        <FadeImage
                          src={cover}
                          alt={project.title}
                          width={1200}
                          className="aspect-[4/3] rounded-sm"
                          imgClassName="w-full h-full object-cover group-hover:scale-[1.04] !duration-[1400ms]"
                        />
                      ) : (
                        <div className="aspect-[4/3] rounded-sm bg-ink-800 grain" />
                      )}
                    </div>
                    <div className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}>
                      <p className="text-[11px] tracking-widest2 uppercase text-gold-300/80">
                        {[project.year, project.medium].filter(Boolean).join(' · ')}
                      </p>
                      <h2 className="font-display text-4xl md:text-6xl text-bone mt-3 leading-[1.05] group-hover:text-gold-200 transition-colors duration-500">
                        {project.title}
                      </h2>
                      {project.statement && (
                        <p className="mt-5 text-bone/55 leading-relaxed line-clamp-4">{project.statement}</p>
                      )}
                      <span className="mt-8 inline-flex items-center gap-3 text-[12px] tracking-widest uppercase text-bone/60 group-hover:text-gold-300 transition-colors">
                        View project
                        <span className="h-px w-8 bg-current transition-all duration-500 group-hover:w-14" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
