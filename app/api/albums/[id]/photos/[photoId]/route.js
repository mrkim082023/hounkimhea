import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../../../lib/db';
import { deleteBlobs } from '../../../../../../lib/blobDelete';

export async function DELETE(_request, { params }) {
  const db = await readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const photos = album.photos || [];
  const idx = photos.findIndex((p) => p.id === params.photoId);
  if (idx === -1) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

  const [removed] = photos.splice(idx, 1);
  album.photos = photos;
  if (album.coverImage === removed.url) {
    album.coverImage = photos[0]?.url || '';
  }

  await writeDb(db);
  await deleteBlobs([removed.url]);
  return NextResponse.json({ ok: true });
}
