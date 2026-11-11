import Link from 'next/link';
import { readDb } from '../../lib/db';
import { albumCover } from '../../lib/photos';

export default async function PhotographyPage() {
  const db = await readDb();
  // Find which categories actually have albums inside them
  const activeCategories = db.categories.filter(category => 
    db.albums.some(album => album.category === category)
  );

  // Build a clean list of categories with a dynamic cover image from their first album
  const categoriesWithCovers = activeCategories.map(category => {
    // Find the first album in this category to steal its cover photo
    const firstAlbum = db.albums.find(album => album.category === category);
    const coverImage = firstAlbum ? albumCover(firstAlbum) : '/placeholder.jpg';
    const totalAlbums = db.albums.filter(album => album.category === category).length;

    return {
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      coverImage,
      totalAlbums
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 text-white min-h-screen pt-24">
      <h1 className="text-4xl font-bold mb-4 font-display">Photography Portfolio</h1>
      <p className="text-neutral-400 mb-12 text-sm">Select a category to view albums</p>
      
      {/* Clean Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoriesWithCovers.map(cat => (
          <Link 
            href={`/photography/${cat.slug}`} 
            key={cat.name} 
            className="group block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-neutral-900 border border-neutral-800"
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-gray-800 relative">
              <img 
                src={cat.coverImage} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-xs font-semibold tracking-wider text-amber-500 uppercase">Gallery</span>
                <h3 className="text-2xl font-bold text-bone mt-1">{cat.name}</h3>
                <p className="text-xs text-neutral-400 mt-1">{cat.totalAlbums} {cat.totalAlbums === 1 ? 'Album' : 'Albums'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
