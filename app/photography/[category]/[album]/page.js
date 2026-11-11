import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readDb } from '../../../../lib/db';
import { albumPhotos } from '../../../../lib/photos';
import AlbumGallery from '../../../../components/AlbumGallery';

export default async function AlbumPage({ params }) {
  const db = await readDb();
  const { category, album: albumId } = params;
  const albumData = db.albums.find(a => a.id === albumId);

  if (!albumData) {
    return notFound();
  }

  const photos = albumPhotos(albumData);

  const fullAlbum = { ...albumData, photos };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Link href="/photography" className="text-xs tracking-widest text-neutral-400 uppercase hover:text-amber-500 transition-colors inline-flex items-center gap-2 mb-6">
          &larr; {albumData.category}
        </Link>
        <h1 className="font-display text-4xl md:text-6xl text-bone mb-12">{albumData.title}</h1>
        <AlbumGallery album={fullAlbum} />
      </div>
    </div>
  );
}
