'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Renders children at the end of <body>, so full-screen overlays always cover the page.
export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
