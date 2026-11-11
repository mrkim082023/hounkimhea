'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/photography', label: 'Photography' },
  { href: '/video', label: 'Video' },
  { href: '/art', label: 'Contemporary Art' },
  { href: '/clients', label: 'Clients' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Slide the bar away while scrolling down, bring it back when scrolling up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 160);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    open ? window.__lenis?.stop() : window.__lenis?.start();
  }, [open]);

  // The admin dashboard has its own top bar.
  if (pathname?.startsWith('/admin/')) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-silk ${
        scrolled ? 'bg-ink-950/95 hairline' : 'bg-transparent'
      } ${hidden && !open ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10 flex items-center justify-between h-20">
        <Link href="/" className="font-display text-2xl tracking-wide text-bone">
          Houn <span className="gold-text">Kimhea</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative text-[13px] tracking-widest uppercase font-body transition-colors duration-300 ${
                  active ? 'text-gold-300' : 'text-bone/80 hover:text-gold-200'
                }`}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute -bottom-2 left-0 right-0 h-px bg-gold-400"
                  />
                ) : (
                  <span className="absolute -bottom-2 left-0 h-px w-0 bg-gold-400/60 transition-all duration-300 ease-silk group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden relative w-8 h-6 flex flex-col justify-between"
        >
          <span
            className={`h-px w-full bg-gold-300 transition-transform duration-300 ease-silk ${
              open ? 'translate-y-[11px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-px w-full bg-gold-300 transition-opacity duration-200 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`h-px w-full bg-gold-300 transition-transform duration-300 ease-silk ${
              open ? '-translate-y-[11px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-ink-950 hairline h-[calc(100dvh-5rem)]"
          >
            <div className="flex flex-col px-6 py-10 gap-6">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className={`text-3xl font-display transition-colors ${pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-gold-300' : 'text-bone/90 hover:text-gold-300'}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
