'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminAlbums from '../../../components/admin/AdminAlbums';
import AdminVideos from '../../../components/admin/AdminVideos';
import AdminClients from '../../../components/admin/AdminClients';
import AdminSettings from '../../../components/admin/AdminSettings';
import AdminCategories from '../../../components/admin/AdminCategories';
import AdminArt from '../../../components/admin/AdminArt';
import { ToastProvider } from '../../../components/admin/ui';

const TABS = [
  { key: 'settings', label: 'Site content' },
  { key: 'albums', label: 'Photography' },
  { key: 'videos', label: 'Videos' },
  { key: 'art', label: 'Contemporary Art' },
  { key: 'clients', label: 'Clients' },
  { key: 'categories', label: 'Categories' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('settings');
  const router = useRouter();

  // Remember the open tab (e.g. after a page refresh).
  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '');
    if (TABS.some((t) => t.key === fromHash)) setTab(fromHash);
  }, []);
  const choose = (key) => {
    setTab(key);
    window.history.replaceState(null, '', `#${key}`);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  };

  return (
    <ToastProvider>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-20">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Admin</p>
            <h1 className="font-display text-4xl text-bone mt-2">Dashboard</h1>
            <p className="text-xs text-bone/40 mt-2">Everything you save here appears on the website straight away.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] tracking-widest uppercase text-gold-200 border border-gold-400/50 hover:bg-gold-400 hover:text-ink-950 transition-colors px-5 py-2.5 rounded-sm"
            >
              View site &#8599;
            </a>
            <button
              onClick={logout}
              className="text-[12px] tracking-widest uppercase text-bone/50 hover:text-gold-300 transition-colors border border-ink-700 px-5 py-2.5 rounded-sm"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 mb-10">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => choose(t.key)}
                className={`relative px-5 py-4 text-[12px] tracking-widest uppercase whitespace-nowrap transition-colors ${
                  tab === t.key ? 'text-gold-300' : 'text-bone/40 hover:text-bone/70'
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <motion.span layoutId="admin-tab" className="absolute left-0 right-0 -bottom-px h-0.5 bg-gold-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {tab === 'settings' && <AdminSettings />}
          {tab === 'albums' && <AdminAlbums />}
          {tab === 'videos' && <AdminVideos />}
          {tab === 'art' && <AdminArt />}
          {tab === 'clients' && <AdminClients />}
          {tab === 'categories' && <AdminCategories />}
        </motion.div>
      </div>
    </ToastProvider>
  );
}
