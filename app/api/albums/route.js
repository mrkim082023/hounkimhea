import { NextResponse } from 'next/server';
import { readDb, writeDb, uid } from '../../../lib/db';
import { albumCover } from '../../../lib/photos';
import manifest from '../../../data/uploads-manifest.json';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const db = await readDb();
  let albums = db.albums;
  if (category) albums = albums.filter((a) => a.category === category);
  albums = albums.map((a) => ({
    ...a,
    displayCover: albumCover(a),
    folderPhotoCount: a.folderPath ? (manifest[a.folderPath] || []).length : 0,
  }));
  return NextResponse.json({ albums, categories: db.categories });
}

export async function POST(request) {
  const body = await request.json();
  const { title, category, description = '', coverImage = '' } = body;

  if (!title || !category) {
    return NextResponse.json({ error: 'Title and category are required.' }, { status: 400 });
  }

  const db = await readDb();
  if (!db.categories.includes(category)) {
    return NextResponse.json({ error: 'Unknown category.' }, { status: 400 });
  }

  const album = {
    id: uid(),
    title,
    category,
    description,
    coverImage,
    photos: [],
    createdAt: new Date().toISOString(),
  };
  db.albums.unshift(album);
  await writeDb(db);

  return NextResponse.json({ album }, { status: 201 });
}
