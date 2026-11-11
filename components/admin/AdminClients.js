'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, Button, Card, ConfirmDelete, ImagePicker, Input, Label, MoveButtons, SectionTitle, Textarea, move, useToast } from './ui';

const EMPTY = { name: '', logo: '', quote: '', website: '' };

function ClientForm({ initial, onSave, onCancel, saveLabel }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-[auto_1fr] gap-6">
        <ImagePicker label="Logo" value={form.logo} onChange={set('logo')} folder="clients" aspect="aspect-[4/3]" contain />
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Prince Bank" />
          </div>
          <div>
            <Label hint="optional">Website</Label>
            <Input value={form.website || ''} onChange={(e) => set('website')(e.target.value)} placeholder="https://…" />
          </div>
        </div>
      </div>
      <div>
        <Label hint="optional — shows in “What partners say”">Testimonial quote</Label>
        <Textarea rows={2} value={form.quote || ''} onChange={(e) => set('quote')(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button
          busy={busy}
          disabled={!form.name.trim()}
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

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  const load = () => api('/api/clients').then((d) => setClients(d.clients)).catch((e) => toast(e.message, 'error'));
  useEffect(() => {
    load();
  }, []);

  const create = async (form) => {
    try {
      await api('/api/clients', { method: 'POST', json: form });
      toast('Client added — it’s live on the site.');
      setAdding(false);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const save = async (id, form) => {
    try {
      await api(`/api/clients/${id}`, { method: 'PATCH', json: form });
      toast('Changes saved.');
      setEditing(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const remove = async (id) => {
    try {
      await api(`/api/clients/${id}`, { method: 'DELETE' });
      toast('Client removed.');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const reorder = async (from, to) => {
    const next = move(clients, from, to);
    setClients(next);
    try {
      await api('/api/reorder', { method: 'POST', json: { collection: 'clients', ids: next.map((c) => c.id) } });
    } catch (e) {
      toast(e.message, 'error');
      load();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <SectionTitle sub="Logos scroll on the homepage and fill the Clients page. Use the arrows to change the order.">
          Clients · {clients.length}
        </SectionTitle>
        {!adding && <Button onClick={() => setAdding(true)}>+ Add client</Button>}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-6">
              <SectionTitle>New client</SectionTitle>
              <ClientForm initial={EMPTY} onSave={create} onCancel={() => setAdding(false)} saveLabel="Add client" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {clients.map((client, i) => (
          <motion.div layout key={client.id}>
            <Card className="p-4">
              {editing === client.id ? (
                <ClientForm initial={{ ...EMPTY, ...client }} onSave={(f) => save(client.id, f)} onCancel={() => setEditing(null)} saveLabel="Save changes" />
              ) : (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <MoveButtons index={i} total={clients.length} onMove={reorder} />
                  <div className="w-16 h-12 rounded-sm bg-bone/95 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {client.logo ? <img src={client.logo} alt="" className="max-w-full max-h-full object-contain" /> : <span className="text-ink-800 text-xs">No logo</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-bone truncate">{client.name}</p>
                    {client.quote && <p className="text-xs text-bone/40 truncate">“{client.quote}”</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <Button variant="ghost" onClick={() => setEditing(client.id)}>
                      Edit
                    </Button>
                    <ConfirmDelete onConfirm={() => remove(client.id)} question="Remove this client?" />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
        {clients.length === 0 && <p className="text-bone/30 text-sm">No clients yet — add your first one above.</p>}
      </div>
    </div>
  );
}
