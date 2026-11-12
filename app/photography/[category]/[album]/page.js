import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteData } from '../../../../lib/db';
import { albumPhotos } from '../../../../lib/photos';
import { slugify } from '../../../../lib/slug';
import Reveal from '../../../../components/Reveal';
import AlbumGallery from '../../../../components/AlbumGallery';


export async function generateStaticParams() {
  const db = await getSiteData();
  return db.albums.map((a) => ({ category: slugify(a.category), album: a.id }));
}

export async function generateMetadata({ params }) {
  const db = await getSiteData();
  const album = db.albums.find((a) => a.id === params.album);
  return { title: album ? `${album.title} — Houn Kimhea` : 'Album' };
}

export default async function AlbumPage({ params }) {
  const db = await getSiteData();
  const album = db.albums.find((a) => a.id === params.album);
  if (!album) notFound();

  const photos = albumPhotos(album);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
      <Reveal>
        <Link
          href={`/photography/${slugify(album.category)}`}
          className="group inline-flex items-center gap-2 text-[12px] tracking-widest uppercase text-bone/40 hover:text-gold-300 transition-colors"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span> {album.category}
        </Link>
        <h1 className="font-display text-5xl md:text-7xl mt-5 text-bone leading-[1.05]">{album.title}</h1>
        <div className="mt-5 mb-14 md:mb-20 flex flex-wrap items-center gap-4 text-[12px] tracking-widest uppercase text-bone/40">
          <span>{photos.length} photos</span>
          <span className="w-10 h-px bg-gold-400/60" />
          <span className="text-gold-300/80">Tap a photo to view</span>
        </div>
        {album.description && (
          <p className="-mt-8 mb-14 max-w-2xl text-bone/60 leading-relaxed">{album.description}</p>
        )}
      </Reveal>

      <AlbumGallery album={{ ...album, photos }} />
    </div>
  );
}
