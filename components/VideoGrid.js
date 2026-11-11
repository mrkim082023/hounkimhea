'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FadeImage from './FadeImage';
import { lockScroll } from './SmoothScroll';
import Portal from './Portal';
import { embedUrl, videoKind, videoThumbnail } from '../lib/video';

// Facebook's player shows reels in a wide frame, so every video uses a wide box.
const isReel = () => false;

function YouTubeFallbackImage({ src, alt }) {
  // maxresdefault doesn't exist for every YouTube video; fall back to hqdefault.
  const [s, setS] = useState(src);
  return (
    <img
      src={s}
      alt=""
      loading="lazy"
      onError={() => s.includes('maxresdefault') && setS(s.replace('maxresdefault', 'hqdefault'))}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-silk group-hover:scale-[1.06]"
    />
  );
}

export default function VideoGrid({ videos, categories = [], showFilters = false }) {
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(null);

  const shown = useMemo(
    () => (filter === 'All' ? videos : videos.filter((v) => v.category === filter)),
    [videos, filter]
  );

  useEffect(() => {
    if (!active) return;
    lockScroll(true);
    const onKey = (e) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  if (!videos.length) {
    return <p className="font-display text-2xl text-bone/40 py-16 text-center">No films published yet.</p>;
  }

  const tabs = ['All', ...categories.filter((c) => videos.some((v) => v.category === c))];

  return (
    <>
      {showFilters && tabs.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`relative px-5 py-2.5 text-[12px] tracking-widest uppercase rounded-full transition-colors duration-300 ${
                filter === t ? 'text-ink-950' : 'text-bone/60 hover:text-bone'
              }`}
            >
              {filter === t && (
                <motion.span
                  layoutId="video-filter"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-gold-400"
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="grid sm:grid-cols-2 gap-6 md:gap-8">
        <AnimatePresence mode="popLayout">
          {shown.map((video, i) => {
            const thumb = videoThumbnail(video);
            return (
              <motion.button
                layout
                key={video.id}
                type="button"
                onClick={() => setActive(video)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative block w-full overflow-hidden rounded-sm aspect-video bg-ink-800 text-left active:scale-[0.985]"
              >
                {thumb ? (
                  thumb.includes('img.youtube.com') ? (
                    <YouTubeFallbackImage src={thumb} alt={video.title} />
                  ) : (
                    <FadeImage
                      src={thumb}
                      alt={video.title}
                      width={1080}
                      className="absolute inset-0"
                      imgClassName="w-full h-full object-cover group-hover:scale-[1.06] !duration-[1200ms]"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 grain" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-ink-950/10 group-hover:via-ink-950/10 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border border-gold-300/70 bg-ink-950/50 flex items-center justify-center transition-all duration-500 ease-silk group-hover:scale-110 group-hover:bg-gold-400 group-hover:border-gold-400">
                    <span className="absolute inset-0 rounded-full border border-gold-300/50 animate-ping opacity-0 group-hover:opacity-60" />
                    <span className="w-0 h-0 border-y-[9px] border-y-transparent border-l-[15px] border-l-gold-300 group-hover:border-l-ink-950 ml-1 transition-colors duration-500" />
                  </span>
                </div>
                <div className="absolute left-5 right-5 bottom-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-700 ease-silk">
                  {video.category && (
                    <p className="text-[10px] tracking-widest2 uppercase text-gold-300/80">{video.category}</p>
                  )}
                  <p className="font-display text-2xl text-bone mt-1 leading-tight">{video.title}</p>
                  {video.description && (
                    <p className="text-xs text-bone/50 mt-1 line-clamp-1">{video.description}</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <Portal>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100] bg-ink-950/95 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setActive(null)}
          >
            <button
              aria-label="Close"
              onClick={() => setActive(null)}
              className="absolute top-5 right-5 w-11 h-11 rounded-full border border-ink-600 text-bone/70 hover:border-gold-400 hover:text-gold-300 transition-colors text-2xl leading-none"
            >
              &times;
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={isReel(active.videoUrl) ? '' : 'w-full max-w-5xl'}
              style={isReel(active.videoUrl) ? { width: 'min(92vw, calc(72vh * 9 / 16))' } : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`bg-black rounded-sm overflow-hidden shadow-2xl mx-auto ${
                  isReel(active.videoUrl) ? 'aspect-[9/16]' : 'aspect-video'
                }`}
              >
                {videoKind(active.videoUrl) === 'file' ? (
                  <video src={active.videoUrl} controls autoPlay playsInline className="w-full h-full" />
                ) : embedUrl(active.videoUrl) ? (
                  <iframe
                    src={embedUrl(active.videoUrl)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    title={active.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <a href={active.videoUrl} target="_blank" rel="noopener noreferrer" className="text-gold-300 underline">
                      Open video &#8599;
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-widest2 uppercase text-gold-300/80">{active.category}</p>
                  <p className="font-display text-3xl text-bone mt-1">{active.title}</p>
                  {active.description && <p className="text-sm text-bone/50 mt-1 max-w-2xl">{active.description}</p>}
                </div>
                {videoKind(active.videoUrl) !== 'file' && (
                  <a
                    href={active.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] tracking-widest uppercase text-bone/50 hover:text-gold-300 transition-colors"
                  >
                    Watch on {videoKind(active.videoUrl) === 'facebook' ? 'Facebook' : videoKind(active.videoUrl) === 'youtube' ? 'YouTube' : 'original site'} &#8599;
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </>
  );
}
