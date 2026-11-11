'use client';

import { useEffect, useState } from 'react';
import { uploadFile } from '../../lib/clientUpload';

async function jsonFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

const SOCIAL_PLATFORMS = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Telegram', 'LinkedIn', 'X (Twitter)', 'Other'];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [aboutPhotoFile, setAboutPhotoFile] = useState(null);

  useEffect(() => {
    jsonFetch('/api/settings')
      .then((data) => setSettings(data.settings))
      .catch((e) => setError(e.message));
  }, []);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    setStatus('');
    try {
      let toSave = settings;
      if (aboutPhotoFile) {
        const url = await uploadFile(aboutPhotoFile, 'about');
        toSave = { ...toSave, aboutPhoto: url };
      }
      const result = await jsonFetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      setSettings(result.settings);
      setAboutPhotoFile(null);
      setStatus('Saved — changes are live on the site now.');
      setTimeout(() => setStatus(''), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => update('skills', [...settings.skills, '']);
  const updateSkill = (i, value) => {
    const next = [...settings.skills];
    next[i] = value;
    update('skills', next);
  };
  const removeSkill = (i) => update('skills', settings.skills.filter((_, idx) => idx !== i));

  const addAchievement = () =>
    update('achievements', [{ year: '', title: '', detail: '' }, ...settings.achievements]);
  const updateAchievement = (i, key, value) => {
    const next = [...settings.achievements];
    next[i] = { ...next[i], [key]: value };
    update('achievements', next);
  };
  const removeAchievement = (i) =>
    update('achievements', settings.achievements.filter((_, idx) => idx !== i));

  const addSocial = () =>
    update('socialLinks', [...settings.socialLinks, { platform: 'Instagram', url: '' }]);
  const updateSocial = (i, key, value) => {
    const next = [...settings.socialLinks];
    next[i] = { ...next[i], [key]: value };
    update('socialLinks', next);
  };
  const removeSocial = (i) =>
    update('socialLinks', settings.socialLinks.filter((_, idx) => idx !== i));

  if (error && !settings) return <p className="text-xs text-red-400">{error}</p>;
  if (!settings) return <p className="text-bone/30 text-sm">Loading…</p>;

  return (
    <div className="space-y-12 pb-10">
      <div className="sticky top-0 z-20 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Site content</p>
        <div className="flex items-center gap-4">
          {status && <p className="text-xs text-gold-300/90">{status}</p>}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="border border-gold-400/60 px-6 py-2.5 text-[12px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <section className="border border-ink-700 rounded-sm p-6 space-y-5">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Homepage hero</p>
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Eyebrow tagline
          </label>
          <input
            value={settings.heroTagline}
            onChange={(e) => update('heroTagline', e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Subtext
          </label>
          <textarea
            rows={3}
            value={settings.heroSubtext}
            onChange={(e) => update('heroSubtext', e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-sm resize-none"
          />
        </div>
      </section>

      <section className="border border-ink-700 rounded-sm p-6 space-y-5">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">About page</p>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Portrait photo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-sm bg-ink-800 overflow-hidden shrink-0">
              <img
                src={aboutPhotoFile ? URL.createObjectURL(aboutPhotoFile) : settings.aboutPhoto}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAboutPhotoFile(e.target.files[0])}
              className="text-sm text-bone/60"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Intro line (large highlighted sentence)
          </label>
          <textarea
            rows={2}
            value={settings.aboutIntro}
            onChange={(e) => update('aboutIntro', e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Bio (separate paragraphs with a blank line)
          </label>
          <textarea
            rows={8}
            value={settings.aboutBio}
            onChange={(e) => update('aboutBio', e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Skills / what I do
          </label>
          <div className="space-y-2">
            {settings.skills.map((skill, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={skill}
                  onChange={(e) => updateSkill(i, e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-sm"
                />
                <button
                  onClick={() => removeSkill(i)}
                  className="text-[11px] tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors px-3"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSkill}
            className="mt-3 text-[11px] tracking-widest uppercase text-gold-300/80 hover:text-gold-300 transition-colors"
          >
            + Add skill
          </button>
        </div>
      </section>

      <section className="border border-ink-700 rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">
            Journey &amp; achievements
          </p>
          <button
            onClick={addAchievement}
            className="text-[11px] tracking-widest uppercase text-gold-300/80 hover:text-gold-300 transition-colors"
          >
            + Add milestone
          </button>
        </div>

        <div className="space-y-3">
          {settings.achievements.map((item, i) => (
            <div key={i} className="grid sm:grid-cols-[100px_1fr_1fr_auto] gap-2 items-start">
              <input
                placeholder="Year"
                value={item.year}
                onChange={(e) => updateAchievement(i, 'year', e.target.value)}
                className="px-3 py-2.5 text-sm rounded-sm"
              />
              <input
                placeholder="Title"
                value={item.title}
                onChange={(e) => updateAchievement(i, 'title', e.target.value)}
                className="px-3 py-2.5 text-sm rounded-sm"
              />
              <input
                placeholder="Detail (optional)"
                value={item.detail}
                onChange={(e) => updateAchievement(i, 'detail', e.target.value)}
                className="px-3 py-2.5 text-sm rounded-sm"
              />
              <button
                onClick={() => removeAchievement(i)}
                className="text-[11px] tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors px-2 py-2.5"
              >
                Remove
              </button>
            </div>
          ))}
          {settings.achievements.length === 0 && (
            <p className="text-bone/30 text-sm">No milestones yet.</p>
          )}
        </div>
      </section>

      <section className="border border-ink-700 rounded-sm p-6 space-y-5">
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Contact info</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
              Email
            </label>
            <input
              value={settings.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
              Phone
            </label>
            <input
              value={settings.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Location line
          </label>
          <input
            value={settings.contactLocation}
            onChange={(e) => update('contactLocation', e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-sm"
          />
        </div>
      </section>

      <section className="border border-ink-700 rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Social media links</p>
          <button
            onClick={addSocial}
            className="text-[11px] tracking-widest uppercase text-gold-300/80 hover:text-gold-300 transition-colors"
          >
            + Add link
          </button>
        </div>
        <div className="space-y-3">
          {settings.socialLinks.map((link, i) => (
            <div key={i} className="grid sm:grid-cols-[160px_1fr_auto] gap-2 items-center">
              <select
                value={link.platform}
                onChange={(e) => updateSocial(i, 'platform', e.target.value)}
                className="px-3 py-2.5 text-sm rounded-sm"
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateSocial(i, 'url', e.target.value)}
                className="px-3 py-2.5 text-sm rounded-sm"
              />
              <button
                onClick={() => removeSocial(i)}
                className="text-[11px] tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors px-2 py-2.5"
              >
                Remove
              </button>
            </div>
          ))}
          {settings.socialLinks.length === 0 && (
            <p className="text-bone/30 text-sm">No social links yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}