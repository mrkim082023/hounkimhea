'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadFile } from '../../lib/clientUpload';

export async function api(url, opts = {}) {
  const init = { ...opts };
  if (opts.json !== undefined) {
    init.body = JSON.stringify(opts.json);
    init.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    delete init.json;
  }
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Your login expired — please sign in again.');
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

/* ---------- Toast messages ("Saved", errors) ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={`px-5 py-3 rounded-sm text-sm shadow-xl border max-w-sm ${
                t.kind === 'error'
                  ? 'bg-red-950/90 border-red-500/40 text-red-200'
                  : 'bg-ink-900/95 border-gold-400/40 text-gold-100'
              }`}
            >
              {t.kind === 'error' ? '⚠ ' : '✓ '}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Small building blocks ---------- */
export function Label({ children, hint }) {
  return (
    <label className="block text-[11px] tracking-widest uppercase text-bone/40 mb-2">
      {children}
      {hint && <span className="normal-case tracking-normal text-bone/25 ml-2">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={`w-full px-4 py-3 text-sm rounded-sm ${props.className || ''}`} />;
}

export function Textarea(props) {
  return <textarea rows={3} {...props} className={`w-full px-4 py-3 text-sm rounded-sm resize-y ${props.className || ''}`} />;
}

export function Select({ options, ...props }) {
  return (
    <select {...props} className={`w-full px-4 py-3 text-sm rounded-sm ${props.className || ''}`}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Button({ variant = 'primary', busy, children, className = '', ...props }) {
  const styles = {
    primary: 'border border-gold-400/70 text-gold-200 hover:bg-gold-400 hover:text-ink-950',
    ghost: 'border border-ink-600 text-bone/60 hover:text-bone hover:border-bone/40',
    danger: 'border border-red-500/30 text-red-300/80 hover:bg-red-500/15 hover:text-red-200',
  };
  return (
    <button
      type="button"
      disabled={busy || props.disabled}
      {...props}
      className={`px-5 py-2.5 text-[11px] tracking-widest uppercase rounded-sm transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {busy ? 'Please wait…' : children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm text-bone/70">
      <span className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-gold-400' : 'bg-ink-600'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={`absolute top-1 w-4 h-4 rounded-full bg-bone ${checked ? 'right-1' : 'left-1'}`}
        />
      </span>
      {label}
    </button>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`border border-ink-700 rounded-sm bg-ink-900/40 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] tracking-widest2 uppercase text-gold-400">{children}</p>
      {sub && <p className="text-xs text-bone/40 mt-1">{sub}</p>}
    </div>
  );
}

/* Up / down arrows to move an item in a list. */
export function MoveButtons({ index, total, onMove }) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        title="Move up"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="w-7 h-5 text-bone/40 hover:text-gold-300 disabled:opacity-20 text-xs"
      >
        ▲
      </button>
      <button
        type="button"
        title="Move down"
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
        className="w-7 h-5 text-bone/40 hover:text-gold-300 disabled:opacity-20 text-xs"
      >
        ▼
      </button>
    </div>
  );
}

export function move(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/* Pick an image: shows a preview, uploads it, and gives back the URL. */
export function ImagePicker({ value, onChange, folder, label = 'Image', aspect = 'aspect-video', contain = false, compress }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const inputRef = useRef(null);
  const toast = useToast();

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setProgress('Uploading…');
    try {
      const url = await uploadFile(file, folder, compress === undefined ? undefined : { compress });
      onChange(url);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`relative w-36 ${aspect} shrink-0 rounded-sm overflow-hidden border border-dashed border-ink-600 hover:border-gold-400/60 bg-ink-800 transition-colors group`}
        >
          {value ? (
            <img src={value} alt="" className={`w-full h-full ${contain ? 'object-contain p-2' : 'object-cover'}`} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-bone/30 text-xs">+ Choose</span>
          )}
          {busy && (
            <span className="absolute inset-0 bg-ink-950/70 flex items-center justify-center text-[11px] text-gold-200">
              {progress}
            </span>
          )}
          {!busy && value && (
            <span className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/60 flex items-center justify-center text-[11px] text-transparent group-hover:text-gold-200 transition-all">
              Change
            </span>
          )}
        </button>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" onClick={() => inputRef.current?.click()} busy={busy}>
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && !busy && (
            <button type="button" onClick={() => onChange('')} className="text-[11px] text-bone/30 hover:text-red-300 text-left">
              Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={pick} />
      </div>
    </div>
  );
}

/* Confirm before something permanent, without a browser popup. */
export function ConfirmDelete({ onConfirm, label = 'Delete', question = 'Delete this?' }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!asking) {
    return (
      <Button variant="danger" onClick={() => setAsking(true)}>
        {label}
      </Button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      <span className="text-xs text-red-200/80">{question}</span>
      <Button
        variant="danger"
        busy={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onConfirm();
          } finally {
            setBusy(false);
            setAsking(false);
          }
        }}
      >
        Yes, delete
      </Button>
      <Button variant="ghost" onClick={() => setAsking(false)}>
        Cancel
      </Button>
    </span>
  );
}
