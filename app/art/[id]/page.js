import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readDb } from '../../../lib/db';
import Reveal from '../../../components/Reveal';
import FadeImage from '../../../components/FadeImage';
import AlbumGallery from '../../../components/AlbumGallery';

const paragraphs = (text = '') => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export async function generateMetadata({ params }) {
  const db = await readDb();
  const p = db.art.projects.find((x) => x.id === params.id);
  return { title: p ? `${p.title} — Houn Kimhea` : 'Contemporary Art' };
}

export default async function ArtProjectPage({ params }) {
  const db = await readDb();
  const projects = db.art.projects;
  const idx = projects.findIndex((x) => x.id === params.id);
  if (idx === -1) notFound();
  const project = projects[idx];
  const photos = (project.photos || []).map((p) => p.url);
  const next = projects.length > 1 ? projects[(idx + 1) % projects.length] : null;

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-28 md:pt-36">
        <Reveal>
          <Link href="/art" className="group inline-flex items-center gap-2 text-[12px] tracking-widest uppercase text-bone/40 hover:text-gold-300 transition-colors">
            <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span> Contemporary Art
          </Link>
          <p className="mt-8 text-[11px] tracking-widest2 uppercase text-gold-300/80">
            {[project.year, project.medium].filter(Boolean).join(' · ')}
          </p>
          <h1 className="font-display text-5xl md:text-8xl mt-3 text-bone leading-[0.95]">{project.title}</h1>
        </Reveal>
      </div>

      {photos[0] && (
        <Reveal className="mx-auto max-w-6xl px-6 md:px-10 mt-14">
          <FadeImage src={photos[0]} alt={project.title} width={1920} eager className="aspect-[16/9] rounded-sm" imgClassName="w-full h-full object-cover" />
        </Reveal>
      )}

      {(project.statement || project.description) && (
        <section className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-14">
          {project.statement && (
            <Reveal>
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-6">Statement</p>
              <div className="space-y-5">
                {paragraphs(project.statement).map((p, i) => (
                  <p key={i} className="font-display text-xl md:text-2xl leading-relaxed text-bone/85">{p}</p>
                ))}
              </div>
            </Reveal>
          )}
          {project.description && (
            <Reveal delay={0.1}>
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-6">About the work</p>
              <div className="space-y-5">
                {paragraphs(project.description).map((p, i) => (
                  <p key={i} className="text-bone/60 leading-relaxed">{p}</p>
                ))}
              </div>
            </Reveal>
          )}
        </section>
      )}

      {photos.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 md:px-10 pb-24">
          <Reveal>
            <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-10">Works · {photos.length}</p>
          </Reveal>
          <AlbumGallery album={{ title: project.title, photos }} />
        </section>
      )}

      {next && (
        <Link href={`/art/${next.id}`} className="group block hairline border-t border-ink-700">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-24 flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-widest2 uppercase text-bone/40">Next project</p>
              <p className="font-display text-4xl md:text-6xl text-bone mt-3 group-hover:text-gold-200 transition-colors duration-500">{next.title}</p>
            </div>
            <span className="w-14 h-14 shrink-0 rounded-full border border-bone/30 flex items-center justify-center transition-all duration-500 group-hover:bg-gold-400 group-hover:border-gold-400 group-hover:text-ink-950">&rarr;</span>
          </div>
        </Link>
      )}
    </div>
  );
}
