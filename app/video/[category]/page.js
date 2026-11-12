import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteData } from '../../../lib/db';
import { findCategoryBySlug } from '../../../lib/slug';
import Reveal from '../../../components/Reveal';
import VideoGrid from '../../../components/VideoGrid';


export async function generateStaticParams() {
  const db = await getSiteData();
  return db.videoCategories.map((c) => ({ category: c.toLowerCase().replace(/\s+/g, '-') }));
}

export async function generateMetadata({ params }) {
  const db = await getSiteData();
  const category = findCategoryBySlug(db.videoCategories, params.category);
  return { title: category ? `${category} — Houn Kimhea` : 'Video' };
}

export default async function VideoCategoryPage({ params }) {
  const db = await getSiteData();
  const category = findCategoryBySlug(db.videoCategories, params.category);
  if (!category) notFound();

  const videos = db.videos.filter((v) => v.category === category);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
      <Reveal>
        <Link
          href="/video"
          className="text-[12px] tracking-widest uppercase text-bone/40 hover:text-gold-300 transition-colors"
        >
          &larr; All films
        </Link>
        <h1 className="font-display text-5xl md:text-6xl mt-5 mb-16 text-bone">{category}</h1>
      </Reveal>

      <VideoGrid videos={videos} />
    </div>
  );
}
