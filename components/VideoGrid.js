'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from './Reveal';

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
      const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : url;
    }
    if (u.hostname.includes('facebook.com') || u.hostname === 'fb.watch') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=0&autoplay=1`;
    }
  } catch {
    return url;
  }
  return url;
}

function isDirectVideo(url) {
  return /\.(mp4|webm|mov)$/i.test(url);
}

export default function VideoGrid({ videos }) {
  const [active, setActive] = useState(null);

  if (!videos.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl text-bone/40">No films published yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-8">
        {videos.map((video, i) => (
          <Reveal key={video.id} delay={(i % 6) * 0.08}>
            <button
              onClick={() => setActive(video)}
              className="group relative block w-full overflow-hidden rounded-sm aspect-video bg-ink-800 text-left"
            >
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 grain" />
              )}
              <div className="absolute inset-0 bg-ink-950/40 group-hover:bg-ink-950/25 transition-colors duration-400 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-gold-300/70 flex items-center justify-center backdrop-blur-sm bg-ink-950/30 group-hover:scale-110 transition-transform duration-400 ease-silk">
                  <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[13px] border-l-gold-300 ml-1" />
                </div>
              </div>
              <div className="absolute left-5 bottom-5 right-5">
                {video.category && (
                  <p className="text-[10px] tracking-widest2 uppercase text-gold-300/80">
                    {video.category}
                  </p>
                )}
                <p className="font-display text-xl text-bone mt-1">{video.title}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-ink-950/95 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setActive(null)}
          >
            <button
              aria-label="Close"
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 text-bone/70 hover:text-gold-300 text-3xl font-display"
            >
              &times;
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl aspect-video bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {isDirectVideo(active.videoUrl) ? (
                <video src={active.videoUrl} controls autoPlay className="w-full h-full" />
              ) : (
                <iframe
                  src={toEmbedUrl(active.videoUrl)}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
