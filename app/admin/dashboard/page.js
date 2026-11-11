'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAlbums from '../../../components/admin/AdminAlbums';
import AdminVideos from '../../../components/admin/AdminVideos';
import AdminClients from '../../../components/admin/AdminClients';
import AdminSettings from '../../../components/admin/AdminSettings';

const TABS = [
  { key: 'settings', label: 'Site content' },
  { key: 'albums', label: 'Photography albums' },
  { key: 'videos', label: 'Video' },
  { key: 'clients', label: 'Clients' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('settings');
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-20">
      <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Admin</p>
          <h1 className="font-display text-4xl text-bone mt-2">Dashboard</h1>
        </div>
        <button
          onClick={logout}
          className="text-[12px] tracking-widest uppercase text-bone/50 hover:text-gold-300 transition-colors border border-ink-700 px-5 py-2.5 rounded-sm"
        >
          Sign out
        </button>
      </div>

      <div className="flex gap-2 border-b border-ink-700 mb-10 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-[12px] tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'text-gold-300 border-gold-400'
                : 'text-bone/40 border-transparent hover:text-bone/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && <AdminSettings />}
      {tab === 'albums' && <AdminAlbums />}
      {tab === 'videos' && <AdminVideos />}
      {tab === 'clients' && <AdminClients />}
    </div>
  );
}