import Link from 'next/link';
import { albumPhotos, albumCover } from '../lib/photos';

export default function AlbumGrid({ albums }) {
  const completedAlbums = albums.map((album) => ({
    ...album,
    coverImage: albumCover(album),
    photos: albumPhotos(album),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {completedAlbums.map((album) => (
        <Link 
          href={`/photography/${album.category.toLowerCase().replace(/\s+/g, '-')}/${album.id}`} 
          key={album.id} 
          className="group block rounded-sm overflow-hidden bg-ink-900 border border-ink-700 hover:border-gold-400/40 transition-colors duration-400 relative"
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-ink-800 relative">
            <img 
              src={album.coverImage} 
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4">
            <span className="text-xs font-semibold tracking-wider text-gold-400 uppercase">{album.category}</span>
            <h3 className="font-display text-xl text-bone mt-1">{album.title}</h3>
            <p className="text-xs text-bone/40 mt-1">{album.photos.length} photos</p>
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gold-300/0 group-hover:border-gold-300/60 flex items-center justify-center text-gold-300 opacity-0 group-hover:opacity-100 transition-all duration-400">
            <span className="text-sm">&#8599;</span>
          </div>
        </Link>
      ))}
    </div>
  );
}