import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { uid } from '../../../lib/db';

// Only used on your own computer (no cloud storage). On Vercel, uploads go
// through /api/blob-upload instead.
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(request) {
  const form = await request.formData();
  const file = form.get('file');
  const folder = (form.get('folder') || 'misc').toString().replace(/[^a-zA-Z0-9_-]/g, '');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
  }
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Cloud storage is not connected.' }, { status: 500 });
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg').replace('quicktime', 'mov');
  const filename = `${uid()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  fs.mkdirSync(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
}
