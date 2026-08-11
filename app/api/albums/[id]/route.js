import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readDb, writeDb } from '../../../../lib/db';

export async function GET(_request, { params }) {
  const db = readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });
  return NextResponse.json({ album });
}

export async function PATCH(request, { params }) {
  const updates = await request.json();
  const db = readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const editable = ['title', 'category', 'description', 'coverImage'];
  for (const key of editable) {
    if (key in updates) album[key] = updates[key];
  }
  writeDb(db);
  return NextResponse.json({ album });
}

export async function DELETE(_request, { params }) {
  const db = readDb();
  const idx = db.albums.findIndex((a) => a.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const dir = path.join(process.cwd(), 'public', 'uploads', 'albums', params.id);
  fs.rmSync(dir, { recursive: true, force: true });

  db.albums.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
