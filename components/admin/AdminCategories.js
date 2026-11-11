'use client';

import { useEffect, useState } from 'react';
import { api, Button, Card, Input, MoveButtons, SectionTitle, move, useToast } from './ui';

function CategoryList({ type, title, sub, initial, onSaved }) {
  // Each row remembers its original name so renames can be applied to albums/videos.
  const [rows, setRows] = useState(initial.map((name) => ({ name, original: name })));
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => setRows(initial.map((name) => ({ name, original: name }))), [initial]);

  const dirty = JSON.stringify(rows.map((r) => r.name)) !== JSON.stringify(initial);

  const save = async () => {
    setBusy(true);
    try {
      const renames = {};
      rows.forEach((r) => r.original && r.original !== r.name.trim() && (renames[r.original] = r.name.trim()));
      const data = await api('/api/categories', {
        method: 'PUT',
        json: { type, categories: rows.map((r) => r.name.trim()), renames },
      });
      toast('Categories saved.');
      onSaved(data);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <SectionTitle sub={sub}>{title}</SectionTitle>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <MoveButtons index={i} total={rows.length} onMove={(a, b) => setRows(move(rows, a, b))} />
            <Input
              value={row.name}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
            />
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="text-[11px] uppercase tracking-widest text-red-300/70 hover:text-red-200 px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Input placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button
          variant="ghost"
          disabled={!newName.trim()}
          onClick={() => {
            setRows([...rows, { name: newName.trim(), original: null }]);
            setNewName('');
          }}
        >
          Add
        </Button>
      </div>
      <Button busy={busy} disabled={!dirty} onClick={save}>
        Save {title.toLowerCase()}
      </Button>
    </Card>
  );
}

export default function AdminCategories() {
  const [data, setData] = useState(null);
  const toast = useToast();
  useEffect(() => {
    api('/api/categories').then(setData).catch((e) => toast(e.message, 'error'));
  }, []);
  if (!data) return <p className="text-bone/30 text-sm">Loading…</p>;
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <CategoryList
        type="photo"
        title="Photo categories"
        sub="Rename, reorder, add or remove. Renaming moves its albums along with it. A category must be empty before it can be removed."
        initial={data.categories}
        onSaved={setData}
      />
      <CategoryList
        type="video"
        title="Video categories"
        sub="These become the filter buttons on the Video page."
        initial={data.videoCategories}
        onSaved={setData}
      />
    </div>
  );
}
