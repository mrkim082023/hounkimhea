'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function JourneyTimeline({ items }) {
  const scrollRef = useRef(null);

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-ink-900/40 hairline border-t border-ink-700 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
        <div className="mb-10">
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Milestones</p>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-bone">
            Journey &amp; <span className="gold-text italic">achievements</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll to earlier milestones"
            className="shrink-0 w-10 h-10 rounded-full border border-ink-700 hover:border-gold-400/60 text-bone/60 hover:text-gold-300 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-lg leading-none">&#8249;</span>
          </button>

          <div
            ref={scrollRef}
            className="flex-1 min-w-0 overflow-x-auto pb-6 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
          >
            <div className="relative flex items-center px-2 min-w-max h-[360px] md:h-[380px]">
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-ink-700" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
                className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 shadow-[0_0_12px_rgba(184,134,44,0.5)]"
              />

              <div className="flex items-center gap-16 md:gap-20 relative">
                {items.map((item, i) => {
                  const above = i % 2 === 0;
                  return (
                    <div key={i} className="relative w-56 md:w-64 flex flex-col items-center">
                      {above && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            className="mb-0 rounded-sm border border-ink-700 bg-ink-950/70 px-5 py-4 hover:border-gold-400/40 transition-colors duration-400 text-left"
                          >
                            <span className="text-sm font-semibold text-gold-400 tracking-wide">
                              {item.year}
                            </span>
                            <h3 className="font-display text-lg text-bone mt-1 leading-snug">
                              {item.title}
                            </h3>
                            {item.detail && (
                              <p className="text-xs text-bone/40 mt-1">{item.detail}</p>
                            )}
                          </motion.div>
                          <div className="w-px h-6 bg-ink-700" />
                        </>
                      )}

                      <motion.span
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="w-[13px] h-[13px] rounded-full bg-gold-400 ring-4 ring-ink-950 z-10 shrink-0"
                      />

                      {!above && (
                        <>
                          <div className="w-px h-6 bg-ink-700" />
                          <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-0 rounded-sm border border-ink-700 bg-ink-950/70 px-5 py-4 hover:border-gold-400/40 transition-colors duration-400 text-left"
                          >
                            <span className="text-sm font-semibold text-gold-400 tracking-wide">
                              {item.year}
                            </span>
                            <h3 className="font-display text-lg text-bone mt-1 leading-snug">
                              {item.title}
                            </h3>
                            {item.detail && (
                              <p className="text-xs text-bone/40 mt-1">{item.detail}</p>
                            )}
                          </motion.div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll to later milestones"
            className="shrink-0 w-10 h-10 rounded-full border border-ink-700 hover:border-gold-400/60 text-bone/60 hover:text-gold-300 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-lg leading-none">&#8250;</span>
          </button>
        </div>
      </div>
    </section>
  );
}