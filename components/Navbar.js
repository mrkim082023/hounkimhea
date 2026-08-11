'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/photography', label: 'Photography' },
  { href: '/video', label: 'Video' },
  { href: '/clients', label: 'Clients' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-silk ${
        scrolled ? 'bg-ink-950/90 backdrop-blur-md hairline' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10 flex items-center justify-between h-20">
        <Link href="/" className="font-display text-2xl tracking-wide text-bone">
          Houn <span className="gold-text">Kimhea</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[13px] tracking-widest uppercase font-body transition-colors duration-300 ${
                  active ? 'text-gold-300' : 'text-bone/80 hover:text-gold-200'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-2 left-0 h-px bg-gold-400 transition-all duration-300 ease-silk ${
                    active ? 'w-full' : 'w-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden relative w-8 h-6 flex flex-col justify-between"
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-ink-950 hairline"
          >
            <div className="flex flex-col px-6 py-6 gap-5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-display text-bone/90 hover:text-gold-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
