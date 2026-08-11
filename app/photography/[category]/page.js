import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readDb } from '../../../lib/db';
import { findCategoryBySlug } from '../../../lib/slug';
import Reveal from '../../../components/Reveal';
import AlbumGrid from '../../../components/AlbumGrid';

export function generateMetadata({ params }) {
  const db = readDb();
  const category = findCategoryBySlug(db.categories, params.category);
  return { title: category ? `${category} — Houn Kimhea` : 'Photography' };
}

export default function CategoryPage({ params }) {
  const db = readDb();
  const category = findCategoryBySlug(db.categories, params.category);
  if (!category) notFound();

  const albums = db.albums.filter((a) => a.category === category);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
      <Reveal>
        <Link
          href="/photography"
          className="text-[12px] tracking-widest uppercase text-bone/40 hover:text-gold-300 transition-colors"
        >
          &larr; All categories
        </Link>
        <h1 className="font-display text-5xl md:text-6xl mt-5 mb-16 text-bone">
          {category}
        </h1>
      </Reveal>

      <AlbumGrid albums={albums} categorySlug={params.category} />
    </div>
  );
}
