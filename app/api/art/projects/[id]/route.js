import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../../lib/db';
import { deleteBlobs } from '../../../../../lib/blobDelete';

export async function PATCH(request, { params }) {
  const updates = await request.json().catch(() => ({}));
  const db = await readDb();
  const project = db.art.projects.find((p) => p.id === params.id);
  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const oldUrls = (project.photos || []).map((p) => p.url);
  for (const key of ['title', 'year', 'medium', 'statement', 'description', 'photos']) {
    if (key in updates) project[key] = updates[key];
  }
  if (!project.title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  await writeDb(db);
  const kept = new Set((project.photos || []).map((p) => p.url));
  await deleteBlobs(oldUrls.filter((u) => !kept.has(u)));
  return NextResponse.json({ project });
}

export async function DELETE(_request, { params }) {
  const db = await readDb();
  const idx = db.art.projects.findIndex((p) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const [removed] = db.art.projects.splice(idx, 1);
  await writeDb(db);
  await deleteBlobs((removed.photos || []).map((p) => p.url));
  return NextResponse.json({ ok: true });
}
