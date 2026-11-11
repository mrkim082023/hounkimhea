import { NextResponse } from 'next/server';
import { readDb, writeDb, uid } from '../../../../../lib/db';

// The browser uploads each photo to cloud storage first, then sends the
// resulting URLs here to be added to the album.
export async function POST(request, { params }) {
  const { urls = [], caption = '' } = await request.json().catch(() => ({}));
  const clean = urls.filter((u) => typeof u === 'string' && u.trim());
  if (!clean.length) {
    return NextResponse.json({ error: 'No photos provided.' }, { status: 400 });
  }

  const db = await readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const added = clean.map((url) => ({ id: uid(), url, caption: String(caption) }));
  album.photos = [...(album.photos || []), ...added];
  if (!album.coverImage && !album.folderPath && added[0]) album.coverImage = added[0].url;

  await writeDb(db);
  return NextResponse.json({ photos: added, album }, { status: 201 });
}
