'use client';

import { motion } from 'framer-motion';

// Fades and lifts its content into view when it scrolls onto the screen.
export default function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
