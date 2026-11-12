'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Shows a gold loading bar the moment a link is clicked, so you always know
// the click worked, until the new page appears.
export default function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState('idle'); // idle | loading | done

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      setState('loading');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (state !== 'loading') return;
    setState('done');
    const t = setTimeout(() => setState('idle'), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[70] h-[3px]">
      <div
        className="h-full bg-gold-300 shadow-[0_0_10px_rgba(212,170,90,0.7)]"
        style={{
          width: state === 'idle' ? '0%' : state === 'loading' ? '75%' : '100%',
          opacity: state === 'idle' ? 0 : 1,
          transition:
            state === 'loading' ? 'width 2.5s cubic-bezier(.1,.6,.2,1), opacity .1s' : 'width .25s ease, opacity .4s ease .15s',
        }}
      />
    </div>
  );
}
