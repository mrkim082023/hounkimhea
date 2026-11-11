'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { img } from '../lib/img';
import { lockScroll } from './SmoothScroll';
import Portal from './Portal';

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80, scale: 0.98 }),
};

// Full-screen photo viewer: arrows, keyboard (← → Esc), swipe on phones,
// thumbnails strip, and the next photo is preloaded so it appears instantly.
export default function Lightbox({ photos, index, onClose, onNav }) {
  const [dir, setDir] = useState(0);
  const open = index != null;
  const photo = open ? photos[index] : null;

  const go = useCallback(
    (step) => {
      if (!open) return;
      setDir(step);
      onNav((index + step + photos.length) % photos.length);
    },
    [open, index, photos.length, onNav]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [open, go, onClose]);

  // Preload neighbours.
  useEffect(() => {
    if (!open) return;
    [1, -1].forEach((s) => {
      const p = photos[(index + s + photos.length) % photos.length];
      if (p) new Image().src = img(p, 1920, 80);
    });
  }, [open, index, photos]);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] bg-ink-950/95 backdrop-blur-sm flex flex-col"
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-5 md:px-8 h-16 shrink-0 text-bone/60" onClick={(e) => e.stopPropagation()}>
            <span className="text-[12px] tracking-widest2 uppercase">
              <span className="text-gold-300">{String(index + 1).padStart(2, '0')}</span> / {String(photos.length).padStart(2, '0')}
            </span>
            <button aria-label="Close" onClick={onClose} className="w-10 h-10 rounded-full border border-ink-600 hover:border-gold-400 hover:text-gold-300 transition-colors text-2xl leading-none">
              &times;
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-20 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={photo}
                src={img(photo, 1920, 80)}
                alt=""
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -400) go(1);
                  else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
                }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full object-contain select-none cursor-grab active:cursor-grabbing shadow-2xl"
                draggable={false}
              />
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  onClick={(e) => { e.stopPropagation(); go(-1); }}
                  className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-ink-600 bg-ink-950/50 items-center justify-center text-bone/70 hover:border-gold-400 hover:text-gold-300 transition-all duration-300 hover:-translate-x-1"
                >
                  &#8592;
                </button>
                <button
                  aria-label="Next photo"
                  onClick={(e) => { e.stopPropagation(); go(1); }}
                  className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-ink-600 bg-ink-950/50 items-center justify-center text-bone/70 hover:border-gold-400 hover:text-gold-300 transition-all duration-300 hover:translate-x-1"
                >
                  &#8594;
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="shrink-0 py-4 px-4 overflow-x-auto" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 w-max mx-auto">
                {photos.map((p, i) => (
                  <button
                    key={p + i}
                    onClick={() => { setDir(i > index ? 1 : -1); onNav(i); }}
                    className={`w-14 h-14 md:w-16 md:h-16 overflow-hidden rounded-sm transition-all duration-300 ${
                      i === index ? 'ring-1 ring-gold-400 opacity-100' : 'opacity-35 hover:opacity-80'
                    }`}
                  >
                    <img src={img(p, 640, 60)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
