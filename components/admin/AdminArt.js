'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../../lib/clientUpload';
import { api, Button, Card, ConfirmDelete, Input, Label, MoveButtons, SectionTitle, Textarea, move, useToast } from './ui';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function ArtworkPhotos({ photos, onChange }) {
  const [progress, setProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const ref = useRef(null);
  const toast = useToast();

  const add = async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    const added = [];
    try {
      for (let i = 0; i < list.length; i++) {
        setProgress(`Uploading ${i + 1} of ${list.length}…`);
        added.push({ id: uid(), url: await uploadFile(list[i], 'art'), caption: '' });
      }
      onChange([...photos, ...added]);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setProgress('');
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); add(e.dataTransfer.files); }}
        onClick={() => !progress && ref.current?.click()}
        className={`cursor-pointer rounded-sm border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-gold-400 bg-gold-400/10' : 'border-ink-600 hover:border-gold-400/50'
        }`}
      >
        <p className="text-gold-200 text-sm">{progress || 'Drop artwork photos here, or click to choose'}</p>
        <p className="text-xs text-bone/30 mt-1">The first photo is the cover.</p>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {photos.map((p, i) => (
            <div key={p.id || p.url} className="relative group aspect-square rounded-sm overflow-hidden bg-ink-800">
              <img src={p.url} alt="" loading="lazy" className="w-full h-full object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 text-[9px] uppercase tracking-widest bg-gold-400 text-ink-950 px-1.5 py-0.5">Cover</span>}
              <div className="absolute inset-0 bg-ink-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest">
                {i !== 0 && (
                  <button type="button" onClick={() => onChange(move(photos, i, 0))} className="text-gold-200">Make cover</button>
                )}
                <div className="flex gap-3 text-bone/70">
                  <button type="button" disabled={i === 0} onClick={() => onChange(move(photos, i, i - 1))} className="disabled:opacity-20">◀</button>
                  <button type="button" disabled={i === photos.length - 1} onClick={() => onChange(move(photos, i, i + 1))} className="disabled:opacity-20">▶</button>
                </div>
                <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="text-red-300">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({ initial, onSave, onCancel, saveLabel, showPhotos = true }) {
  const [form, setForm] = useState({ title: '', year: '', medium: '', statement: '', description: '', photos: [], ...initial });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-[1fr_120px_1fr] gap-4">
        <div>
          <Label>Project / artwork title</Label>
          <Input value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Unquieted End" />
        </div>
        <div>
          <Label>Year</Label>
          <Input value={form.year} onChange={(e) => set('year')(e.target.value)} placeholder="2025" />
        </div>
        <div>
          <Label hint="optional">Medium</Label>
          <Input value={form.medium} onChange={(e) => set('medium')(e.target.value)} placeholder="e.g. Archival pigment print" />
        </div>
      </div>
      <div>
        <Label hint="the idea behind the work">Project statement</Label>
        <Textarea rows={4} value={form.statement} onChange={(e) => set('statement')(e.target.value)} />
      </div>
      <div>
        <Label hint="process, exhibition, size, etc. — leave an empty line between paragraphs">Art description</Label>
        <Textarea rows={5} value={form.description} onChange={(e) => set('description')(e.target.value)} />
      </div>
      {showPhotos && (
        <div>
          <Label>Artwork photos</Label>
          <ArtworkPhotos photos={form.photos || []} onChange={set('photos')} />
        </div>
      )}
      <div className="flex gap-3">
        <Button busy={busy} disabled={!form.title.trim()} onClick={async () => { setBusy(true); try { await onSave(form); } finally { setBusy(false); } }}>
          {saveLabel}
        </Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </div>
  );
}

export default function AdminArt() {
  const [art, setArt] = useState(null);
  const [intro, setIntro] = useState({ heading: '', intro: '', statement: '' });
  const [savingIntro, setSavingIntro] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const { art } = await api('/api/art');
      setArt(art);
      setIntro({ heading: art.heading || '', intro: art.intro || '', statement: art.statement || '' });
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  useEffect(() => { load(); }, []);

  if (!art) return <p className="text-bone/30 text-sm">Loading…</p>;
  const projects = art.projects || [];

  const reorder = async (from, to) => {
    const next = move(projects, from, to);
    setArt({ ...art, projects: next });
    try {
      await api('/api/art', { method: 'PATCH', json: { projectOrder: next.map((p) => p.id) } });
    } catch (e) {
      toast(e.message, 'error');
      load();
    }
  };

  return (
    <div className="space-y-10">
      <Card className="p-6 space-y-5">
        <SectionTitle sub="Shown at the top of the Contemporary Art page. Leave an empty line between paragraphs.">Artist statement</SectionTitle>
        <div className="grid sm:grid-cols-[220px_1fr] gap-4">
          <div>
            <Label hint="first word of the big title">Page heading</Label>
            <Input value={intro.heading} onChange={(e) => setIntro({ ...intro, heading: e.target.value })} placeholder="Art" />
          </div>
          <div>
            <Label hint="optional">Short introduction</Label>
            <Input value={intro.intro} onChange={(e) => setIntro({ ...intro, intro: e.target.value })} placeholder="One or two sentences about your art practice" />
          </div>
        </div>
        <div>
          <Label>Artist statement</Label>
          <Textarea rows={8} value={intro.statement} onChange={(e) => setIntro({ ...intro, statement: e.target.value })} />
        </div>
        <Button
          busy={savingIntro}
          onClick={async () => {
            setSavingIntro(true);
            try {
              await api('/api/art', { method: 'PATCH', json: intro });
              toast('Artist statement saved.');
              load();
            } catch (e) {
              toast(e.message, 'error');
            } finally {
              setSavingIntro(false);
            }
          }}
        >
          Save statement
        </Button>
      </Card>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionTitle sub="Each project gets its own page with its statement, description and artwork photos.">
            Art projects · {projects.length}
          </SectionTitle>
          {!adding && <Button onClick={() => setAdding(true)}>+ New project</Button>}
        </div>

        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="p-6">
                <SectionTitle>New project</SectionTitle>
                <ProjectForm
                  initial={{}}
                  saveLabel="Create project"
                  onCancel={() => setAdding(false)}
                  onSave={async (form) => {
                    try {
                      const { project } = await api('/api/art/projects', { method: 'POST', json: form });
                      if (form.photos?.length) await api(`/api/art/projects/${project.id}`, { method: 'PATCH', json: { photos: form.photos } });
                      toast('Project created — it’s live on the site.');
                      setAdding(false);
                      load();
                    } catch (e) {
                      toast(e.message, 'error');
                    }
                  }}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {projects.map((project, i) => {
          const open = openId === project.id;
          return (
            <motion.div layout key={project.id}>
              <Card className={open ? 'border-gold-400/40' : ''}>
                <div className="flex items-center gap-4 p-4">
                  <MoveButtons index={i} total={projects.length} onMove={reorder} />
                  <button type="button" onClick={() => setOpenId(open ? null : project.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                    <div className="w-16 h-16 rounded-sm bg-ink-800 overflow-hidden shrink-0">
                      {project.photos?.[0] && <img src={project.photos[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-bone truncate">{project.title}</p>
                      <p className="text-xs text-bone/40">{[project.year, `${project.photos?.length || 0} photos`].filter(Boolean).join(' · ')}</p>
                    </div>
                  </button>
                  <div className="flex gap-2 shrink-0">
                    <Button variant={open ? 'primary' : 'ghost'} onClick={() => setOpenId(open ? null : project.id)}>{open ? 'Close' : 'Edit'}</Button>
                    <ConfirmDelete
                      question="Delete project and its photos?"
                      onConfirm={async () => {
                        try {
                          await api(`/api/art/projects/${project.id}`, { method: 'DELETE' });
                          toast('Project deleted.');
                          load();
                        } catch (e) {
                          toast(e.message, 'error');
                        }
                      }}
                    />
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-ink-700 p-5 md:p-6">
                        <ProjectForm
                          initial={project}
                          saveLabel="Save project"
                          onCancel={() => setOpenId(null)}
                          onSave={async (form) => {
                            try {
                              await api(`/api/art/projects/${project.id}`, { method: 'PATCH', json: form });
                              toast('Project saved.');
                              load();
                            } catch (e) {
                              toast(e.message, 'error');
                            }
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {projects.length === 0 && !adding && <p className="text-bone/30 text-sm">No art projects yet — click “New project”.</p>}
      </div>
    </div>
  );
}
