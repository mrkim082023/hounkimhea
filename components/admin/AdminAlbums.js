'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../../lib/clientUpload';
import {
  api, Button, Card, ConfirmDelete, Input, Label, MoveButtons, SectionTitle, Select, Textarea, Toggle, move, useToast,
} from './ui';

function NewAlbum({ categories, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', category: categories[0] || '', description: '' });
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <Card className="p-6 space-y-5">
      <SectionTitle sub="e.g. Pre-Wedding holds one album per couple. Create the album, then add its photos.">New album</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label>Album title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Dara & Sophea" />
        </div>
        <div>
          <Label>Category</Label>
          <Select options={categories} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
      </div>
      <div>
        <Label hint="optional">Description</Label>
        <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="flex gap-3">
        <Button
          busy={busy}
          disabled={!form.title.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              const { album } = await api('/api/albums', { method: 'POST', json: form });
              toast('Album created — now add photos to it.');
              onCreated(album.id);
            } catch (e) {
              toast(e.message, 'error');
            } finally {
              setBusy(false);
            }
          }}
        >
          Create album
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function AlbumEditor({ album, categories, reload, onClose }) {
  const [details, setDetails] = useState({
    title: album.title,
    category: album.category,
    description: album.description || '',
    featured: !!album.featured,
  });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  const patch = async (json, msg) => {
    try {
      await api(`/api/albums/${album.id}`, { method: 'PATCH', json });
      if (msg) toast(msg);
      await reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const upload = async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    const urls = [];
    try {
      for (let i = 0; i < list.length; i++) {
        setProgress(`Uploading ${i + 1} of ${list.length}…`);
        urls.push(await uploadFile(list[i], `albums/${album.id}`));
      }
      setProgress('Saving…');
      await api(`/api/albums/${album.id}/photos`, { method: 'POST', json: { urls } });
      toast(`${urls.length} photo${urls.length > 1 ? 's' : ''} added.`);
      await reload();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setProgress('');
    }
  };

  const removePhoto = async (photoId) => {
    try {
      await api(`/api/albums/${album.id}/photos/${photoId}`, { method: 'DELETE' });
      toast('Photo removed.');
      await reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const movePhoto = (from, to) => patch({ photoOrder: move(album.photos, from, to).map((p) => p.id) });

  const toggleFolderPhoto = (file) => {
    const hidden = new Set(album.hiddenFolderPhotos || []);
    hidden.has(file) ? hidden.delete(file) : hidden.add(file);
    patch({ hiddenFolderPhotos: [...hidden] });
  };

  const cover = album.displayCover;
  const total = album.folderPhotos.filter((p) => !p.hidden).length + album.photos.length;

  return (
    <div className="border-t border-ink-700 p-5 md:p-6 space-y-8">
      {/* Details */}
      <div className="space-y-5">
        <SectionTitle>Album details</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label>Title</Label>
            <Input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Select options={categories} value={details.category} onChange={(e) => setDetails({ ...details, category: e.target.value })} />
          </div>
        </div>
        <div>
          <Label hint="optional — shown under the album title">Description</Label>
          <Textarea rows={2} value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} />
        </div>
        <Toggle checked={details.featured} onChange={(v) => setDetails({ ...details, featured: v })} label="Show on homepage (Recent albums)" />
        <div className="flex gap-3">
          <Button
            busy={saving}
            disabled={!details.title.trim()}
            onClick={async () => {
              setSaving(true);
              await patch(details, 'Album details saved.');
              setSaving(false);
            }}
          >
            Save details
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-4">
        <SectionTitle sub="Hover a photo to set it as the cover, move it, or remove it. Big photos are shrunk automatically before upload.">
          Photos · {total}
        </SectionTitle>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files);
          }}
          onClick={() => !progress && fileRef.current?.click()}
          className={`cursor-pointer rounded-sm border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? 'border-gold-400 bg-gold-400/10' : 'border-ink-600 hover:border-gold-400/50'
          }`}
        >
          <p className="text-gold-200 text-sm">{progress || 'Drop photos here, or click to choose'}</p>
          <p className="text-xs text-bone/30 mt-1">You can select many photos at once.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {album.photos.length > 0 && (
          <div>
            <p className="text-[11px] tracking-widest uppercase text-bone/40 mb-3">Uploaded photos</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {album.photos.map((photo, i) => (
                <div key={photo.id} className="relative group aspect-square rounded-sm overflow-hidden bg-ink-800">
                  <img src={photo.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  {cover === photo.url && <span className="absolute top-1 left-1 text-[9px] uppercase tracking-widest bg-gold-400 text-ink-950 px-1.5 py-0.5">Cover</span>}
                  <div className="absolute inset-0 bg-ink-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest">
                    {cover !== photo.url && (
                      <button onClick={() => patch({ coverImage: photo.url }, 'Cover updated.')} className="text-gold-200 hover:text-gold-100">
                        Set as cover
                      </button>
                    )}
                    <div className="flex gap-3 text-bone/70">
                      <button disabled={i === 0} onClick={() => movePhoto(i, i - 1)} className="disabled:opacity-20 hover:text-bone">◀</button>
                      <button disabled={i === album.photos.length - 1} onClick={() => movePhoto(i, i + 1)} className="disabled:opacity-20 hover:text-bone">▶</button>
                    </div>
                    <button onClick={() => removePhoto(photo.id)} className="text-red-300 hover:text-red-200">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {album.folderPhotos.length > 0 && (
          <div>
            <p className="text-[11px] tracking-widest uppercase text-bone/40 mb-1">Original photos</p>
            <p className="text-xs text-bone/30 mb-3">These came with the website. You can hide any of them; they show before your uploaded photos.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {album.folderPhotos.map((p) => (
                <div key={p.file} className="relative group aspect-square rounded-sm overflow-hidden bg-ink-800">
                  <img src={p.url} alt="" loading="lazy" className={`w-full h-full object-cover transition-opacity ${p.hidden ? 'opacity-20' : ''}`} />
                  {cover === p.url && <span className="absolute top-1 left-1 text-[9px] uppercase tracking-widest bg-gold-400 text-ink-950 px-1.5 py-0.5">Cover</span>}
                  {p.hidden && <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-bone/60">Hidden</span>}
                  <div className="absolute inset-0 bg-ink-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                    {!p.hidden && cover !== p.url && (
                      <button onClick={() => patch({ coverImage: p.url }, 'Cover updated.')} className="text-gold-200 hover:text-gold-100">
                        Set as cover
                      </button>
                    )}
                    <button onClick={() => toggleFolderPhoto(p.file)} className={p.hidden ? 'text-gold-200' : 'text-red-300'}>
                      {p.hidden ? 'Show' : 'Hide'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  const load = () =>
    api('/api/albums')
      .then((d) => {
        setAlbums(d.albums);
        setCategories(d.categories);
      })
      .catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await api(`/api/albums/${id}`, { method: 'DELETE' });
      toast('Album deleted.');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const toggleFeatured = async (a) => {
    setAlbums((list) => list.map((x) => (x.id === a.id ? { ...x, featured: !x.featured } : x)));
    try {
      await api(`/api/albums/${a.id}`, { method: 'PATCH', json: { featured: !a.featured } });
    } catch (e) {
      toast(e.message, 'error');
      load();
    }
  };

  const reorderWithin = async (category, from, to) => {
    const inCat = albums.filter((a) => a.category === category);
    const movedCat = move(inCat, from, to);
    let k = 0;
    const next = albums.map((a) => (a.category === category ? movedCat[k++] : a));
    setAlbums(next);
    try {
      await api('/api/reorder', { method: 'POST', json: { collection: 'albums', ids: next.map((a) => a.id) } });
    } catch (e) {
      toast(e.message, 'error');
      load();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <SectionTitle sub="Click Manage to edit an album and its photos. ★ = shown on the homepage. Arrows change the order.">
          Photography albums · {albums.length}
        </SectionTitle>
        {!adding && <Button onClick={() => setAdding(true)}>+ New album</Button>}
      </div>

      <AnimatePresence>
        {adding && categories.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <NewAlbum
              categories={categories}
              onCancel={() => setAdding(false)}
              onCreated={async (id) => {
                setAdding(false);
                await load();
                setOpenId(id);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {categories.map((category) => {
        const inCat = albums.filter((a) => a.category === category);
        return (
          <div key={category}>
            <p className="text-[11px] tracking-widest2 uppercase text-bone/50 mb-3">
              {category} · {inCat.length}
            </p>
            <div className="space-y-3">
              {inCat.map((album, i) => {
                const count = album.folderPhotos.filter((p) => !p.hidden).length + album.photos.length;
                const open = openId === album.id;
                return (
                  <motion.div layout key={album.id}>
                    <Card className={open ? 'border-gold-400/40' : ''}>
                      <div className="flex items-center gap-4 p-4">
                        <MoveButtons index={i} total={inCat.length} onMove={(a, b) => reorderWithin(category, a, b)} />
                        <button onClick={() => setOpenId(open ? null : album.id)} className="flex items-center gap-4 text-left flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-sm bg-ink-800 overflow-hidden shrink-0">
                            {album.displayCover && <img src={album.displayCover} alt="" loading="lazy" className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-bone truncate">{album.title}</p>
                            <p className="text-xs text-bone/40">{count} photos</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          title={album.featured ? 'Shown on homepage — click to remove' : 'Click to show on homepage'}
                          onClick={() => toggleFeatured(album)}
                          className={`text-xl transition-colors ${album.featured ? 'text-gold-300' : 'text-bone/20 hover:text-gold-300/60'}`}
                        >
                          ★
                        </button>
                        <div className="flex gap-2 shrink-0">
                          <Button variant={open ? 'primary' : 'ghost'} onClick={() => setOpenId(open ? null : album.id)}>
                            {open ? 'Close' : 'Manage'}
                          </Button>
                          <ConfirmDelete onConfirm={() => remove(album.id)} question="Delete album and its photos?" />
                        </div>
                      </div>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <AlbumEditor album={album} categories={categories} reload={load} onClose={() => setOpenId(null)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
              {inCat.length === 0 && <p className="text-bone/25 text-sm">No albums in this category yet.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
