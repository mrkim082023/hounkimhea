import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readDb, writeDb } from '../../../../../../lib/db';

export async function DELETE(_request, { params }) {
  const db = readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const idx = album.photos.findIndex((p) => p.id === params.photoId);
  if (idx === -1) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

  const [removed] = album.photos.splice(idx, 1);
  const filePath = path.join(process.cwd(), 'public', removed.url.replace(/^\//, ''));
  fs.rm(filePath, { force: true }, () => {});

  if (album.coverImage === removed.url) {
    album.coverImage = album.photos[0]?.url || '';
  }

  writeDb(db);
  return NextResponse.json({ ok: true });
}
