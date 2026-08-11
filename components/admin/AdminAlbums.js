'use client';

import { useEffect, useState } from 'react';

async function jsonFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '' });

  const load = async () => {
    const data = await jsonFetch('/api/albums');
    setAlbums(data.albums);
    setCategories(data.categories);
    setForm((f) => ({ ...f, category: f.category || data.categories[0] || '' }));
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const createAlbum = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await jsonFetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm((f) => ({ ...f, title: '', description: '' }));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteAlbum = async (id) => {
    if (!confirm('Delete this album and all its photos?')) return;
    try {
      await jsonFetch(`/api/albums/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const uploadPhotos = async (albumId, files, caption) => {
    const body = new FormData();
    Array.from(files).forEach((f) => body.append('files', f));
    body.append('caption', caption || '');
    try {
      await jsonFetch(`/api/albums/${albumId}/photos`, { method: 'POST', body });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deletePhoto = async (albumId, photoId) => {
    try {
      await jsonFetch(`/api/albums/${albumId}/photos/${photoId}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={createAlbum} className="border border-ink-700 rounded-sm p-6 space-y-5">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">New album</p>
        <p className="text-xs text-bone/40 -mt-3">
          e.g. a Pre-Wedding category can hold one album per couple &mdash; create an album here,
          then upload that couple&apos;s photos into it below.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
              Album title
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Dara & Sophea"
              className="w-full px-4 py-3 text-sm rounded-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Description (optional)
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-sm resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="border border-gold-400/60 px-6 py-3 text-[12px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400 disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create album'}
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-4">
        {categories.map((category) => {
          const inCategory = albums.filter((a) => a.category === category);
          if (!inCategory.length) return null;
          return (
            <div key={category}>
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-3">
                {category} &middot; {inCategory.length}
              </p>
              <div className="space-y-3 mb-8">
                {inCategory.map((album) => (
                  <AlbumRow
                    key={album.id}
                    album={album}
                    open={openId === album.id}
                    onToggle={() => setOpenId(openId === album.id ? null : album.id)}
                    onDelete={() => deleteAlbum(album.id)}
                    onUpload={(files, caption) => uploadPhotos(album.id, files, caption)}
                    onDeletePhoto={(photoId) => deletePhoto(album.id, photoId)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {albums.length === 0 && (
          <p className="text-bone/30 text-sm">No albums yet — create your first one above.</p>
        )}
      </div>
    </div>
  );
}

function AlbumRow({ album, open, onToggle, onDelete, onUpload, onDeletePhoto }) {
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    if (!e.target.files.length) return;
    setUploading(true);
    await onUpload(e.target.files, caption);
    setUploading(false);
    setCaption('');
    e.target.value = '';
  };

  return (
    <div className="border border-ink-700 rounded-sm">
      <div className="flex items-center justify-between p-4">
        <button onClick={onToggle} className="flex items-center gap-4 text-left flex-1 min-w-0">
          <div className="w-14 h-14 rounded-sm bg-ink-800 overflow-hidden shrink-0">
            {album.coverImage && (
              <img src={album.coverImage} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-bone truncate">{album.title}</p>
            <p className="text-xs text-bone/40">{album.photos?.length || 0} photos</p>
          </div>
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggle}
            className="text-[11px] tracking-widest uppercase text-bone/50 hover:text-gold-300 transition-colors"
          >
            {open ? 'Close' : 'Manage'}
          </button>
          <button
            onClick={onDelete}
            className="text-[11px] tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-700 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Caption for new uploads (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm rounded-sm"
            />
            <label className="border border-gold-400/60 px-5 py-2.5 text-[12px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400 cursor-pointer text-center">
              {uploading ? 'Uploading…' : 'Add photos'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {album.photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {album.photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-sm overflow-hidden bg-ink-800">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/60 text-transparent group-hover:text-red-300 flex items-center justify-center text-xs tracking-widest uppercase transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
