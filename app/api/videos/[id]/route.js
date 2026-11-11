import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';
import { deleteBlobs } from '../../../../lib/blobDelete';

export async function PATCH(request, { params }) {
  const updates = await request.json();
  const db = await readDb();
  const video = db.videos.find((v) => v.id === params.id);
  if (!video) return NextResponse.json({ error: 'Video not found.' }, { status: 404 });

  const editable = ['title', 'videoUrl', 'thumbnail', 'description', 'category'];
  for (const key of editable) {
    if (key in updates) video[key] = updates[key];
  }
  await writeDb(db);
  return NextResponse.json({ video });
}

export async function DELETE(_request, { params }) {
  const db = await readDb();
  const idx = db.videos.findIndex((v) => v.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Video not found.' }, { status: 404 });
  const [removed] = db.videos.splice(idx, 1);
  await writeDb(db);
  await deleteBlobs([removed.videoUrl, removed.thumbnail]);
  return NextResponse.json({ ok: true });
}
