'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Portal from './Portal';
import Lightbox from './Lightbox';
import { lockScroll } from './SmoothScroll';
import { img } from '../lib/img';

const photoUrls = (item) => (item.photos || []).map((p) => (typeof p === 'string' ? p : p.url)).filter(Boolean);

function MilestoneCard({ item, onOpen, from }) {
  const photos = photoUrls(item);
  const clickable = photos.length > 0 || !!item.description;
  return (
    <motion.button
      type="button"
      onClick={clickable ? onOpen : undefined}
      initial={{ opacity: 0, y: from }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`group w-full text-left rounded-sm border border-ink-700 bg-ink-950/70 overflow-hidden transition-all duration-500 ${
        clickable ? 'cursor-pointer hover:border-gold-400/50 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(184,134,44,0.35)]' : 'cursor-default'
      }`}
    >
      {photos[0] && (
        <div className="h-24 overflow-hidden">
          <img
            src={img(photos[0], 640)}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          />
        </div>
      )}
      <div className="px-5 py-4">
        <span className="text-sm font-semibold text-gold-400 tracking-wide">{item.year}</span>
        <h3 className="font-display text-lg text-bone mt-1 leading-snug">{item.title}</h3>
        {item.detail && <p className="text-xs text-bone/40 mt-1">{item.detail}</p>}
        {clickable && (
          <p className="mt-3 text-[10px] tracking-widest uppercase text-gold-300/70 group-hover:text-gold-300 transition-colors">
            {photos.length > 0 ? `View ${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'Read more'} &rarr;
          </p>
        )}
      </div>
    </motion.button>
  );
}

function MilestoneModal({ item, onClose }) {
  const [lightbox, setLightbox] = useState(null);
  const photos = item ? photoUrls(item) : [];

  useEffect(() => {
    if (!item) return;
    lockScroll(true);
    const onKey = (e) => e.key === 'Escape' && lightbox === null && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [item, onClose, lightbox]);

  return (
    <Portal>
      <AnimatePresence>
        {item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-ink-950/90 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
            data-lenis-prevent
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl my-8 rounded-sm border border-ink-700 bg-ink-900 shadow-2xl"
            >
              <button
                aria-label="Close"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full border border-ink-600 bg-ink-950/60 text-bone/70 hover:border-gold-400 hover:text-gold-300 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
              {photos[0] && (
                <button type="button" onClick={() => setLightbox(0)} className="block w-full aspect-[16/9] overflow-hidden cursor-zoom-in">
                  <img src={img(photos[0], 1200)} alt="" className="w-full h-full object-cover" />
                </button>
              )}
              <div className="p-6 md:p-10">
                <p className="text-sm font-semibold text-gold-400 tracking-wide">{item.year}</p>
                <h3 className="font-display text-3xl md:text-4xl text-bone mt-2 leading-tight">{item.title}</h3>
                {item.detail && <p className="text-[12px] tracking-widest uppercase text-gold-300/70 mt-3">{item.detail}</p>}
                {item.description && (
                  <div className="mt-6 space-y-4 text-bone/70 leading-relaxed text-[15px]">
                    {item.description.split(/\n\s*\n/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
                {photos.length > 1 && (
                  <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.slice(1).map((p, i) => (
                      <button
                        key={p + i}
                        type="button"
                        onClick={() => setLightbox(i + 1)}
                        className="group aspect-square overflow-hidden rounded-sm cursor-zoom-in"
                      >
                        <img src={img(p, 640)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {item && <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onNav={setLightbox} />}
    </Portal>
  );
}

export default function JourneyTimeline({ items }) {
  const scrollRef = useRef(null);
  const [open, setOpen] = useState(null);

  const scrollByAmount = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-ink-900/40 hairline border-t border-ink-700 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Milestones</p>
            <h2 className="font-display text-4xl md:text-5xl mt-3 text-bone">
              Journey &amp; <span className="gold-text italic">achievements</span>
            </h2>
          </div>
          <p className="text-[11px] tracking-widest uppercase text-bone/30">Click a milestone to see more</p>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Earlier milestones"
            className="shrink-0 w-10 h-10 rounded-full border border-ink-700 hover:border-gold-400/60 text-bone/60 hover:text-gold-300 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-lg leading-none">&#8249;</span>
          </button>

          <div ref={scrollRef} data-lenis-prevent className="flex-1 min-w-0 overflow-x-auto pb-6 scroll-smooth [scrollbar-width:thin]">
            <div className="relative flex items-center px-2 min-w-max min-h-[560px]">
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-ink-700" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
                className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500"
              />
              <div className="flex items-center gap-12 md:gap-16 relative">
                {items.map((item, i) => {
                  const above = i % 2 === 0;
                  return (
                    <div key={i} className="relative w-56 md:w-64 h-[540px] flex flex-col items-center justify-center">
                      <div className={`absolute left-0 right-0 flex flex-col items-center ${above ? 'bottom-1/2 pb-0' : 'top-1/2'}`}>
                        {above ? (
                          <>
                            <MilestoneCard item={item} from={16} onOpen={() => setOpen(item)} />
                            <div className="w-px h-6 bg-ink-700" />
                          </>
                        ) : (
                          <>
                            <div className="w-px h-6 bg-ink-700" />
                            <MilestoneCard item={item} from={-16} onOpen={() => setOpen(item)} />
                          </>
                        )}
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-[13px] h-[13px] rounded-full bg-gold-400 ring-4 ring-ink-950 z-10"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Later milestones"
            className="shrink-0 w-10 h-10 rounded-full border border-ink-700 hover:border-gold-400/60 text-bone/60 hover:text-gold-300 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-lg leading-none">&#8250;</span>
          </button>
        </div>
      </div>

      <MilestoneModal item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
