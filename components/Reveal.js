'use client';

import { motion } from 'framer-motion';

// Fades and lifts its content into view when it scrolls onto the screen.
export default function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
