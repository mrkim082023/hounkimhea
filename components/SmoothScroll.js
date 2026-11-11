'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

// Gives the whole site a soft, gliding scroll. Turned off in the admin panel
// (forms scroll better natively) and for visitors who prefer reduced motion.
export default function SmoothScroll() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1,
      
      smoothWheel: true,
    });
    window.__lenis = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [isAdmin]);

  // Start each new page at the top.
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Pause / resume smooth scrolling (used while a lightbox or video is open).
export function lockScroll(locked) {
  if (typeof window === 'undefined') return;
  if (locked) {
    window.__lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
  } else {
    window.__lenis?.start();
    document.documentElement.style.overflow = '';
  }
}
