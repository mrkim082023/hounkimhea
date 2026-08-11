import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { uid } from '../../../lib/db';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

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
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: 'File is larger than 15MB.' }, { status: 400 });
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${uid()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  fs.mkdirSync(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
}
