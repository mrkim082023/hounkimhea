import { NextResponse } from 'next/server';
import { readDb, writeDb, uid } from '../../../lib/db';

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ videos: db.videos, videoCategories: db.videoCategories });
}

export async function POST(request) {
  const body = await request.json();
  const { title, videoUrl, thumbnail = '', description = '', category = '' } = body;

  if (!title || !videoUrl || !category) {
    return NextResponse.json(
      { error: 'Title, video URL, and category are required.' },
      { status: 400 }
    );
  }

  const db = await readDb();
  if (!db.videoCategories.includes(category)) {
    return NextResponse.json({ error: 'Unknown video category.' }, { status: 400 });
  }

  const video = {
    id: uid(),
    title,
    videoUrl,
    thumbnail,
    description,
    category,
    createdAt: new Date().toISOString(),
  };
  db.videos.unshift(video);
  await writeDb(db);

  return NextResponse.json({ video }, { status: 201 });
}
