'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const line = {
  hidden: { opacity: 0, y: 32 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({
  tagline = 'Photography & Filmmaking — Cambodia & beyond',
  subtext = 'I photograph and film the moments people want to keep — weddings, events, and documentary stories, shot with patience and a quiet eye for light.',
}) {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden grain">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.svg
          initial={{ opacity: 0, rotate: -20, scale: 0.9 }}
          animate={{ opacity: 0.5, rotate: 0, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          width="820"
          height="820"
          viewBox="0 0 200 200"
          className="opacity-40 md:opacity-50"
        >
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            {Array.from({ length: 9 }).map((_, i) => {
              const angle = (i / 9) * Math.PI * 2;
              const x1 = 100 + Math.cos(angle) * 34;
              const y1 = 100 + Math.sin(angle) * 34;
              const x2 = 100 + Math.cos(angle) * 92;
              const y2 = 100 + Math.sin(angle) * 92;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#b8862c"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              );
            })}
          </motion.g>
          <circle cx="100" cy="100" r="34" fill="none" stroke="#dbb659" strokeWidth="0.6" strokeOpacity="0.6" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="#dbb659" strokeWidth="0.4" strokeOpacity="0.35" />
        </motion.svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 w-full">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[12px] tracking-widest2 uppercase text-gold-300/90 mb-6"
        >
          Photography &amp; Filmmaking &mdash; Cambodia &amp; beyond
        </motion.p>

        <h1 className="font-display text-[15vw] leading-[0.95] sm:text-7xl md:text-8xl lg:text-[7.5rem] text-bone">
          <motion.span custom={0} variants={line} initial="hidden" animate="show" className="block">
            Houn
          </motion.span>
          <motion.span custom={1} variants={line} initial="hidden" animate="show" className="block gold-text italic">
            Kimhea
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-md text-bone/60 font-body text-[15px] leading-relaxed"
        >
          I photograph and film the moments people want to keep &mdash; weddings, events, and
          documentary stories, shot with patience and a quiet eye for light.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex items-center gap-6"
        >
          <Link
            href="/photography"
            className="inline-flex items-center gap-2 border border-gold-400/60 px-7 py-3.5 text-[13px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400"
          >
            View work
          </Link>
          <Link
            href="/about"
            className="text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300 transition-colors duration-300"
          >
            About Kimhea
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-widest2 uppercase text-bone/30">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-gold-400/70 to-transparent"
        />
      </motion.div>
    </section>
  );
}
