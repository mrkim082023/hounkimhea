import Link from 'next/link';
import { readDb } from '../../lib/db';
import { albumCover } from '../../lib/photos';
import { slugify } from '../../lib/slug';
import Reveal from '../../components/Reveal';
import FadeImage from '../../components/FadeImage';

export const metadata = { title: 'Photography — Houn Kimhea' };

export default async function PhotographyPage() {
  const db = await readDb();
  const categories = db.categories
    .map((category) => {
      const albums = db.albums.filter((a) => a.category === category);
      const coverAlbum = albums.find((a) => a.featured) || albums[0];
      return { name: category, slug: slugify(category), count: albums.length, cover: coverAlbum ? albumCover(coverAlbum) : null };
    })
    .filter((c) => c.count > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
      <Reveal>
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Photography</p>
        <h1 className="font-display text-5xl md:text-7xl mt-3 mb-4 text-bone">
          Stories in <span className="gold-text italic">frames</span>
        </h1>
        <p className="text-bone/40 mb-16 text-sm">Choose a collection to explore its albums.</p>
      </Reveal>

      {categories.length === 0 ? (
        <p className="font-display text-2xl text-bone/40 py-16 text-center">Albums coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={(i % 2) * 0.12}>
              <Link href={`/photography/${cat.slug}`} className="group block relative overflow-hidden rounded-sm active:scale-[0.985] transition-transform duration-200">
                <FadeImage
                  src={cat.cover}
                  alt={cat.name}
                  width={1200}
                  className="aspect-[16/11]"
                  imgClassName="w-full h-full object-cover group-hover:scale-[1.06] !duration-[1400ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-9 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] tracking-widest2 uppercase text-gold-300/80">
                      {cat.count} {cat.count === 1 ? 'album' : 'albums'}
                    </p>
                    <h2 className="font-display text-4xl md:text-5xl text-bone mt-2">{cat.name}</h2>
                  </div>
                  <span className="w-12 h-12 shrink-0 rounded-full border border-bone/30 flex items-center justify-center text-bone transition-all duration-500 ease-silk group-hover:bg-gold-400 group-hover:border-gold-400 group-hover:text-ink-950 group-hover:rotate-[-45deg]">
                    &rarr;
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
