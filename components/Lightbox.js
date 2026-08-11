'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Lightbox({ photos, index, onClose, onNav }) {
  const photo = index != null ? photos[index] : null;

  const handleKey = useCallback(
    (e) => {
      if (index == null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onNav((index - 1 + photos.length) % photos.length);
    },
    [index, onClose, onNav, photos.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = index != null ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey, index]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-ink-950/97 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onClose}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-bone/70 hover:text-gold-300 text-3xl font-display transition-colors"
          >
            &times;
          </button>

          <button
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              onNav((index - 1 + photos.length) % photos.length);
            }}
            className="absolute left-3 md:left-8 text-bone/50 hover:text-gold-300 text-4xl px-2 transition-colors"
          >
            &#8249;
          </button>

          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl max-h-[82vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.url}
              alt={photo.caption || 'Photograph by Houn Kimhea'}
              className="max-h-[75vh] max-w-full object-contain shadow-2xl"
            />
            {photo.caption && (
              <p className="text-bone/60 text-sm tracking-wide font-body">{photo.caption}</p>
            )}
          </motion.div>

          <button
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              onNav((index + 1) % photos.length);
            }}
            className="absolute right-3 md:right-8 text-bone/50 hover:text-gold-300 text-4xl px-2 transition-colors"
          >
            &#8250;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
