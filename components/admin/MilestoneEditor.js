'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../../lib/clientUpload';
import { MoveButtons, move } from './ui';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function PhotoStrip({ photos, onChange }) {
  const [progress, setProgress] = useState('');
  const ref = useRef(null);
  const add = async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name));
    const added = [];
    try {
      for (let i = 0; i < list.length; i++) {
        setProgress(`Uploading ${i + 1}/${list.length}…`);
        added.push({ id: uid(), url: await uploadFile(list[i], 'milestones') });
      }
      onChange([...photos, ...added]);
    } catch (e) {
      alert(e.message);
    } finally {
      setProgress('');
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p, i) => (
          <div key={p.id || p.url} className="relative group w-20 h-20 rounded-sm overflow-hidden bg-ink-800">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            {i === 0 && <span className="absolute top-0.5 left-0.5 text-[8px] uppercase bg-gold-400 text-ink-950 px-1">Main</span>}
            <div className="absolute inset-0 bg-ink-950/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-[9px] uppercase tracking-widest transition-opacity">
              <div className="flex gap-2 text-bone/70">
                <button type="button" disabled={i === 0} onClick={() => onChange(move(photos, i, i - 1))} className="disabled:opacity-20">◀</button>
                <button type="button" disabled={i === photos.length - 1} onClick={() => onChange(move(photos, i, i + 1))} className="disabled:opacity-20">▶</button>
              </div>
              <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="text-red-300">Remove</button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => !progress && ref.current?.click()}
          className="w-20 h-20 rounded-sm border border-dashed border-ink-600 hover:border-gold-400/60 text-[10px] text-bone/40 hover:text-gold-200 px-1"
        >
          {progress || '+ Add photos'}
        </button>
        <input ref={ref} type="file" accept="image/*,.heic,.heif" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
    </div>
  );
}

// Editor for the "Journey & achievements" milestones on the About page.
export default function MilestoneEditor({ items, onChange }) {
  const [openIdx, setOpenIdx] = useState(null);
  const update = (i, key, value) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const open = openIdx === i;
        const photos = (item.photos || []).map((p) => (typeof p === 'string' ? { id: p, url: p } : p));
        return (
          <div key={i} className={`border rounded-sm ${open ? 'border-gold-400/40' : 'border-ink-700'}`}>
            <div className="flex items-center gap-3 p-3">
              <MoveButtons index={i} total={items.length} onMove={(a, b) => { onChange(move(items, a, b)); setOpenIdx(null); }} />
              <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="flex-1 min-w-0 flex items-center gap-3 text-left">
                <span className="text-gold-400 text-sm w-12 shrink-0">{item.year || '—'}</span>
                <span className="text-bone truncate">{item.title || 'Untitled milestone'}</span>
                {(photos.length > 0 || item.description) && (
                  <span className="text-[10px] text-bone/30 shrink-0">
                    {photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''}` : ''}
                    {photos.length && item.description ? ' · ' : ''}
                    {item.description ? 'description' : ''}
                  </span>
                )}
              </button>
              <button type="button" onClick={() => setOpenIdx(open ? null : i)} className="text-[11px] uppercase tracking-widest text-bone/50 hover:text-gold-300">
                {open ? 'Close' : 'Edit'}
              </button>
              <button
                type="button"
                onClick={() => { onChange(items.filter((_, j) => j !== i)); setOpenIdx(null); }}
                className="text-[11px] uppercase tracking-widest text-red-400/70 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="border-t border-ink-700 p-4 space-y-4">
                    <div className="grid sm:grid-cols-[100px_1fr_1fr] gap-2">
                      <input placeholder="Year" value={item.year || ''} onChange={(e) => update(i, 'year', e.target.value)} className="px-3 py-2.5 text-sm rounded-sm" />
                      <input placeholder="Title" value={item.title || ''} onChange={(e) => update(i, 'title', e.target.value)} className="px-3 py-2.5 text-sm rounded-sm" />
                      <input placeholder="Short detail, e.g. 1st Place Winner" value={item.detail || ''} onChange={(e) => update(i, 'detail', e.target.value)} className="px-3 py-2.5 text-sm rounded-sm" />
                    </div>
                    <div>
                      <p className="text-[11px] tracking-widest uppercase text-bone/40 mb-2">Description <span className="normal-case tracking-normal text-bone/25">— shown when visitors click the milestone</span></p>
                      <textarea
                        rows={4}
                        value={item.description || ''}
                        onChange={(e) => update(i, 'description', e.target.value)}
                        placeholder="Tell the story behind this milestone…"
                        className="w-full px-3 py-2.5 text-sm rounded-sm resize-y"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] tracking-widest uppercase text-bone/40 mb-2">Photos <span className="normal-case tracking-normal text-bone/25">— the first one is the main photo</span></p>
                      <PhotoStrip photos={photos} onChange={(next) => update(i, 'photos', next)} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-bone/30 text-sm">No milestones yet.</p>}
    </div>
  );
}
