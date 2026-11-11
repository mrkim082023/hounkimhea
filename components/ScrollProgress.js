'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

// Thin gold line at the top of the screen that fills as you scroll down the page.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500"
    />
  );
}
