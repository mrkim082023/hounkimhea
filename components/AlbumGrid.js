import Link from 'next/link';
import { albumPhotos, albumCover } from '../lib/photos';
import { slugify } from '../lib/slug';
import Reveal from './Reveal';
import FadeImage from './FadeImage';

export default function AlbumGrid({ albums }) {
  const list = albums.map((album) => ({
    ...album,
    cover: albumCover(album),
    count: albumPhotos(album).length,
  }));

  if (!list.length) {
    return <p className="font-display text-2xl text-bone/40 py-16 text-center">No albums here yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {list.map((album, i) => (
        <Reveal key={album.id} delay={(i % 3) * 0.1}>
          <Link
            href={`/photography/${slugify(album.category)}/${album.id}`}
            className="group block relative overflow-hidden rounded-sm active:scale-[0.985] transition-transform duration-200"
          >
            <FadeImage
              src={album.cover}
              alt={album.title}
              width={828}
              className="aspect-[4/5]"
              imgClassName="w-full h-full object-cover group-hover:scale-[1.06] !duration-[1200ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700" />
            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-700 ease-silk">
              <p className="text-[10px] tracking-widest2 uppercase text-gold-300/90">{album.category}</p>
              <h3 className="font-display text-2xl md:text-3xl text-bone mt-1 leading-tight">{album.title}</h3>
              <div className="mt-3 flex items-center gap-3 text-[11px] tracking-widest uppercase text-bone/60">
                <span>{album.count} photos</span>
                <span className="h-px w-0 bg-gold-400 transition-all duration-700 ease-silk group-hover:w-10" />
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 ease-silk text-gold-300">
                  View album
                </span>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold-300/0 group-hover:ring-gold-300/30 transition-all duration-700" />
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
