'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FadeImage from './FadeImage';
import Lightbox from './Lightbox';

export default function AlbumGallery({ album }) {
  const photos = album?.photos || [];
  const [index, setIndex] = useState(null);

  if (!photos.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl text-bone/40">No photos in this album yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 [column-fill:_balance]">
        {photos.map((photo, i) => (
          <motion.button
            key={photo + i}
            type="button"
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group relative mb-4 md:mb-5 block w-full break-inside-avoid overflow-hidden rounded-sm cursor-zoom-in"
          >
            <FadeImage
              src={photo}
              alt={`${album.title} — photo ${i + 1}`}
              width={828}
              imgClassName="w-full h-auto group-hover:scale-[1.04] !duration-[1200ms]"
            />
            <span className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/20 transition-colors duration-500" />
            <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-bone/40 bg-ink-950/60 flex items-center justify-center text-bone text-sm opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-silk">
              &#10530;
            </span>
          </motion.button>
        ))}
      </div>

      <Lightbox photos={photos} index={index} onClose={() => setIndex(null)} onNav={setIndex} />
    </>
  );
}
