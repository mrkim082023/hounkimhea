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

  if ('category' in updates && !db.categories.includes(updates.category)) {
    return NextResponse.json({ error: 'Unknown category.' }, { status: 400 });
  }
  for (const key of ['title', 'category', 'description', 'coverImage', 'featured', 'hiddenFolderPhotos']) {
    if (key in updates) album[key] = updates[key];
  }
  // New photo order: must contain exactly the album's existing photos.
  if (Array.isArray(updates.photoOrder)) {
    const byId = new Map((album.photos || []).map((p) => [p.id, p]));
    const ordered = updates.photoOrder.map((id) => byId.get(id)).filter(Boolean);
    if (ordered.length === byId.size) album.photos = ordered;
  }
  if (!album.title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
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
