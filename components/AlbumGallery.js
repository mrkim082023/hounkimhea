'use client';

import { useState } from 'react';

export default function AlbumGallery({ album }) {
  // Use the photos list provided by our automated parent page
  const photos = album?.photos || [];

  const [index, setIndex] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl text-bone/40">No photos in this album yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-bone">{album?.title}</h2>
      
      {/* Lightbox / Fullscreen view when a photo is clicked */}
      {index !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIndex(null)}
        >
          <img 
            src={photos[index]} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button 
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setIndex(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Grid Layout for Photos */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo, i) => (
          <div 
            key={i} 
            className="break-inside-avoid overflow-hidden rounded-xl bg-gray-900 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 group"
            onClick={() => setIndex(i)}
          >
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
