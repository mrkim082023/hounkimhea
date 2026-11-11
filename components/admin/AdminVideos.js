'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../../lib/clientUpload';
import { videoKind, videoThumbnail } from '../../lib/video';
import {
  api, Button, Card, ConfirmDelete, ImagePicker, Input, Label, MoveButtons, SectionTitle, Select, Textarea, Toggle, move, useToast,
} from './ui';

const EMPTY = { title: '', category: '', videoUrl: '', thumbnail: '', description: '', featured: false };

function VideoForm({ initial, categories, onSave, onCancel, saveLabel }) {
  const [form, setForm] = useState({ ...initial, category: initial.category || categories[0] || '' });
  const [source, setSource] = useState(videoKind(initial.videoUrl) === 'file' ? 'upload' : 'link');
  const [busy, setBusy] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef(null);
  const toast = useToast();
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadMsg(`Uploading ${(file.size / 1024 / 1024).toFixed(0)} MB… keep this page open`);
    try {
      set('videoUrl')(await uploadFile(file, 'videos', { compress: false }));
      setUploadMsg('Video uploaded ✓');
    } catch (err) {
      toast(err.message, 'error');
      setUploadMsg('');
    }
  };

  const preview = videoThumbnail(form);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => set('title')(e.target.value)} />
        </div>
        <div>
          <Label>Category</Label>
          <Select options={categories} value={form.category} onChange={(e) => set('category')(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Video</Label>
        <div className="flex gap-2 mb-3">
          {[
            ['link', 'Paste a link (YouTube / Facebook / Vimeo)'],
            ['upload', 'Upload a video file'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSource(key)}
              className={`px-4 py-2 text-[11px] tracking-widest uppercase rounded-sm border transition-colors ${
                source === key ? 'border-gold-400 text-gold-300 bg-gold-400/10' : 'border-ink-700 text-bone/50 hover:text-bone/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {source === 'link' ? (
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={videoKind(form.videoUrl) === 'file' ? '' : form.videoUrl}
            onChange={(e) => set('videoUrl')(e.target.value)}
          />
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              {form.videoUrl && videoKind(form.videoUrl) === 'file' ? 'Replace video file' : 'Choose video file'}
            </Button>
            <span className="text-xs text-bone/50">{uploadMsg || (videoKind(form.videoUrl) === 'file' ? 'A video file is attached.' : 'MP4, WebM or MOV')}</span>
            <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={pickVideo} />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        <ImagePicker
          label="Thumbnail"
          value={form.thumbnail}
          onChange={set('thumbnail')}
          folder="video-thumbnails"
        />
        <div className="text-xs text-bone/40 leading-relaxed pt-6">
          {form.thumbnail
            ? 'Your own thumbnail is used.'
            : preview
              ? 'No thumbnail uploaded — the YouTube thumbnail will be used automatically.'
              : 'Facebook and uploaded videos need a thumbnail image, otherwise a plain dark card is shown.'}
        </div>
      </div>

      <div>
        <Label hint="optional">Description</Label>
        <Textarea rows={2} value={form.description || ''} onChange={(e) => set('description')(e.target.value)} />
      </div>

      <Toggle checked={!!form.featured} onChange={set('featured')} label="Show on homepage (Featured films)" />

      <div className="flex gap-3">
        <Button
          busy={busy}
          disabled={!form.title.trim() || !form.videoUrl}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(form);
            } finally {
              setBusy(false);
            }
          }}
        >
          {saveLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  const load = () =>
    api('/api/videos')
      .then((d) => {
        setVideos(d.videos);
        setCategories(d.videoCategories);
      })
      .catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  const create = async (form) => {
    try {
      await api('/api/videos', { method: 'POST', json: form });
      toast('Video added — it’s live on the site.');
      setAdding(false);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  const save = async (id, form) => {
    try {
      await api(`/api/videos/${id}`, { method: 'PATCH', json: form });
      toast('Changes saved.');
      setEditing(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  const remove = async (id) => {
    try {
      await api(`/api/videos/${id}`, { method: 'DELETE' });
      toast('Video deleted.');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };
  const toggleFeatured = async (v) => {
    setVideos((list) => list.map((x) => (x.id === v.id ? { ...x, featured: !x.featured } : x)));
    try {
      await api(`/api/videos/${v.id}`, { method: 'PATCH', json: { featured: !v.featured } });
    } catch (e) {
      toast(e.message, 'error');
      load();
    }
  };
  const reorderWithin = async (category, from, to) => {
    const inCat = videos.filter((v) => v.category === category);
    const movedCat = move(inCat, from, to);
    let k = 0;
    const next = videos.map((v) => (v.category === category ? movedCat[k++] : v));
    setVideos(next);
    try {
      await api('/api/reorder', { method: 'POST', json: { collection: 'videos', ids: next.map((v) => v.id) } });
    } catch (e) {
      toast(e.message, 'error');
      load();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <SectionTitle sub="Click Edit to change any video. ★ = shown on the homepage. Arrows change the order.">
          Videos · {videos.length}
        </SectionTitle>
        {!adding && <Button onClick={() => setAdding(true)}>+ Add video</Button>}
      </div>

      <AnimatePresence>
        {adding && categories.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-6">
              <SectionTitle>New video</SectionTitle>
              <VideoForm initial={EMPTY} categories={categories} onSave={create} onCancel={() => setAdding(false)} saveLabel="Add video" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.map((category) => {
        const inCat = videos.filter((v) => v.category === category);
        return (
          <div key={category}>
            <p className="text-[11px] tracking-widest2 uppercase text-bone/50 mb-3">
              {category} · {inCat.length}
            </p>
            <div className="space-y-3">
              {inCat.map((video, i) => (
                <motion.div layout key={video.id}>
                  <Card className="p-4">
                    {editing === video.id ? (
                      <VideoForm
                        initial={{ ...EMPTY, ...video }}
                        categories={categories}
                        onSave={(f) => save(video.id, f)}
                        onCancel={() => setEditing(null)}
                        saveLabel="Save changes"
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <MoveButtons index={i} total={inCat.length} onMove={(a, b) => reorderWithin(category, a, b)} />
                        <div className="w-28 aspect-video rounded-sm bg-ink-800 overflow-hidden shrink-0">
                          {videoThumbnail(video) && <img src={videoThumbnail(video).replace('maxresdefault', 'hqdefault')} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-bone truncate">{video.title}</p>
                          <p className="text-xs text-bone/40 truncate">
                            {{ youtube: 'YouTube', facebook: 'Facebook', vimeo: 'Vimeo', file: 'Uploaded file', link: 'Link' }[videoKind(video.videoUrl)]}
                            {video.description ? ` · ${video.description}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          title={video.featured ? 'Shown on homepage — click to remove' : 'Click to show on homepage'}
                          onClick={() => toggleFeatured(video)}
                          className={`text-xl transition-colors ${video.featured ? 'text-gold-300' : 'text-bone/20 hover:text-gold-300/60'}`}
                        >
                          ★
                        </button>
                        <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto justify-end">
                          <Button variant="ghost" onClick={() => setEditing(video.id)}>
                            Edit
                          </Button>
                          <ConfirmDelete onConfirm={() => remove(video.id)} question="Delete this video?" />
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
              {inCat.length === 0 && <p className="text-bone/25 text-sm">No videos in this category yet.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
