'use client';

import { useEffect, useState } from 'react';

async function jsonFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function uploadFile(file, folder) {
  const body = new FormData();
  body.append('file', file);
  body.append('folder', folder);
  const data = await jsonFetch('/api/upload', { method: 'POST', body });
  return data.url;
}

const SOURCE_OPTIONS = [
  { key: 'link', label: 'Link (YouTube / Facebook / Vimeo)' },
  { key: 'upload', label: 'Upload video file' },
];

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [source, setSource] = useState('link');
  const [thumbFile, setThumbFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    videoUrl: '',
    description: '',
  });

  const load = async () => {
    const data = await jsonFetch('/api/videos');
    setVideos(data.videos);
    setCategories(data.videoCategories);
    setForm((f) => ({ ...f, category: f.category || data.videoCategories[0] || '' }));
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const createVideo = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      let videoUrl = form.videoUrl;
      if (source === 'upload') {
        if (!videoFile) throw new Error('Choose a video file to upload.');
        videoUrl = await uploadFile(videoFile, 'videos');
      }
      let thumbnail = '';
      if (thumbFile) thumbnail = await uploadFile(thumbFile, 'videos');

      await jsonFetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, videoUrl, thumbnail }),
      });

      setForm((f) => ({ ...f, title: '', videoUrl: '', description: '' }));
      setThumbFile(null);
      setVideoFile(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await jsonFetch(`/api/videos/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={createVideo} className="border border-ink-700 rounded-sm p-6 space-y-5">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">New video</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
              Title
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-3">
            Video source
          </label>
          <div className="flex gap-2 mb-4">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => setSource(opt.key)}
                className={`px-4 py-2 text-[11px] tracking-widest uppercase rounded-sm border transition-colors ${
                  source === opt.key
                    ? 'border-gold-400 text-gold-300 bg-gold-400/10'
                    : 'border-ink-700 text-bone/50 hover:text-bone/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {source === 'link' ? (
            <input
              required
              type="url"
              placeholder="https://www.youtube.com/watch?v=… or a Facebook video link"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-sm"
            />
          ) : (
            <input
              required
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full text-sm text-bone/60"
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Thumbnail image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files[0])}
            className="w-full text-sm text-bone/60"
          />
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
          {creating ? 'Saving…' : 'Add video'}
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-4">
        {categories.map((category) => {
          const inCategory = videos.filter((v) => v.category === category);
          if (!inCategory.length) return null;
          return (
            <div key={category}>
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-3">
                {category} &middot; {inCategory.length}
              </p>
              <div className="space-y-3 mb-8">
                {inCategory.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between gap-4 border border-ink-700 rounded-sm p-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-12 rounded-sm bg-ink-800 overflow-hidden shrink-0">
                        {video.thumbnail && (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-bone truncate">{video.title}</p>
                        <p className="text-xs text-bone/40 truncate">{video.videoUrl}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="text-[11px] tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {videos.length === 0 && (
          <p className="text-bone/30 text-sm">No videos yet — add your first one above.</p>
        )}
      </div>
    </div>
  );
}
