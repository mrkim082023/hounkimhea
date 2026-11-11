'use client';

import { useEffect, useRef, useState } from 'react';
import { img } from '../lib/img';

// An <img> that fades and sharpens in once it has loaded, instead of popping in.
export default function FadeImage({ src, alt = '', width = 828, className = '', imgClassName = '', eager = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-ink-800 ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-700/60 to-ink-800 transition-opacity duration-700 ${
          loaded ? 'opacity-0' : 'opacity-100 animate-pulse'
        }`}
      />
      <img
        ref={ref}
        src={img(src, width)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`transition-[opacity,transform,filter] duration-[900ms] ease-silk ${
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.04] blur-sm'
        } ${imgClassName}`}
        {...rest}
      />
    </div>
  );
}
