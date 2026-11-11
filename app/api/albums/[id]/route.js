import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';
import { deleteBlobs } from '../../../../lib/blobDelete';

export async function GET(_request, { params }) {
  const db = await readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });
  return NextResponse.json({ album });
}

export async function PATCH(request, { params }) {
  const updates = await request.json();
  const db = await readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const editable = ['title', 'category', 'description', 'coverImage'];
  for (const key of editable) {
    if (key in updates) album[key] = updates[key];
  }
  await writeDb(db);
  return NextResponse.json({ album });
}

export async function DELETE(_request, { params }) {
  const db = await readDb();
  const idx = db.albums.findIndex((a) => a.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const [removed] = db.albums.splice(idx, 1);
  await writeDb(db);
  await deleteBlobs([...(removed.photos || []).map((p) => p.url), removed.coverImage]);
  return NextResponse.json({ ok: true });
}
