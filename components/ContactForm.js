'use client';

import { useState } from 'react';

const CONTACT_EMAIL = 'hounkimhea11@gmail.com';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', shootType: '', message: '' });
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${form.name || 'website'}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nShoot type: ${form.shootType}\n\n${form.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={update('name')}
            className="w-full px-4 py-3 text-sm rounded-sm"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
            Email
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={update('email')}
            className="w-full px-4 py-3 text-sm rounded-sm"
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
          What are you looking for?
        </label>
        <select value={form.shootType} onChange={update('shootType')} className="w-full px-4 py-3 text-sm rounded-sm">
          <option value="">Select one</option>
          <option>Event</option>
          <option>Party</option>
          <option>Pre-Wedding</option>
          <option>Pre-graduation</option>
          <option>Documentary</option>
          <option>Products</option>
          <option>Video / film</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
          Message
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update('message')}
          className="w-full px-4 py-3 text-sm rounded-sm resize-none"
          placeholder="Tell me about your date, location, and vision."
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 border border-gold-400/60 px-8 py-3.5 text-[13px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400"
      >
        Send inquiry
      </button>

      {sent && (
        <p className="text-xs text-gold-300/80 pt-2">
          Your email app should be opening now &mdash; if not, write directly to {CONTACT_EMAIL}.
        </p>
      )}
    </form>
  );
}
