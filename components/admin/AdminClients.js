'use client';

import { useEffect, useState } from 'react';
import { uploadFile } from '../../lib/clientUpload';

async function jsonFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [form, setForm] = useState({ name: '', quote: '' });

  const load = async () => {
    const data = await jsonFetch('/api/clients');
    setClients(data.clients);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const createClient = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      let logo = '';
      if (logoFile) {
        logo = await uploadFile(logoFile, 'clients');
      }
      await jsonFetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, logo }),
      });
      setForm({ name: '', quote: '' });
      setLogoFile(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteClient = async (id) => {
    if (!confirm('Remove this client?')) return;
    try {
      await jsonFetch(`/api/clients/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={createClient} className="border border-ink-700 rounded-sm p-6 space-y-5">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">New client</p>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Logo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
            className="w-full text-sm text-bone/60"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Quote (optional)
          </label>
          <textarea
            rows={2}
            value={form.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="border border-gold-400/60 px-6 py-3 text-[12px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400 disabled:opacity-50"
        >
          {creating ? 'Saving…' : 'Add client'}
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between gap-4 border border-ink-700 rounded-sm p-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-sm bg-ink-800 overflow-hidden shrink-0 flex items-center justify-center">
                {client.logo && <img src={client.logo} alt="" className="w-full h-full object-contain" />}
              </div>
              <div className="min-w-0">
                <p className="text-bone truncate">{client.name}</p>
                {client.quote && <p className="text-xs text-bone/40 truncate">{client.quote}</p>}
              </div>
            </div>
            <button
              onClick={() => deleteClient(client.id)}
              className="text-[11px] tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-bone/30 text-sm">No clients yet — add your first one above.</p>
        )}
      </div>
    </div>
  );
}
