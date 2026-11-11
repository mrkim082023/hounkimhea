'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// Each page gently fades and rises in. (No exit animation, so navigating feels instant.)
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
