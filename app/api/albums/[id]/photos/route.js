import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readDb, writeDb, uid } from '../../../../../lib/db';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(request, { params }) {
  const db = readDb();
  const album = db.albums.find((a) => a.id === params.id);
  if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });

  const form = await request.formData();
  const files = form.getAll('files').filter((f) => typeof f !== 'string');
  const caption = (form.get('caption') || '').toString();

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'albums', album.id);
  fs.mkdirSync(dir, { recursive: true });

  const added = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type) || file.size > 15 * 1024 * 1024) continue;
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${uid()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), bytes);
    const photo = { id: uid(), url: `/uploads/albums/${album.id}/${filename}`, caption };
    album.photos.push(photo);
    added.push(photo);
  }

  if (!album.coverImage && added[0]) album.coverImage = added[0].url;

  writeDb(db);
  return NextResponse.json({ photos: added, album }, { status: 201 });
}
