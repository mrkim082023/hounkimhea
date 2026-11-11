import { NextResponse } from 'next/server';
import { readDb, writeDb, uid } from '../../../../lib/db';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  const db = await readDb();
  const project = {
    id: uid(),
    title: body.title.trim(),
    year: body.year || '',
    medium: body.medium || '',
    statement: body.statement || '',
    description: body.description || '',
    photos: [],
    createdAt: new Date().toISOString(),
  };
  db.art.projects.unshift(project);
  await writeDb(db);
  return NextResponse.json({ project }, { status: 201 });
}
