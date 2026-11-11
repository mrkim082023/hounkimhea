import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ categories: db.categories, videoCategories: db.videoCategories });
}

// Body: { type: 'photo' | 'video', categories: [...new list...], renames: { oldName: newName } }
export async function PUT(request) {
  const { type, categories, renames = {} } = await request.json().catch(() => ({}));
  if (!['photo', 'video'].includes(type) || !Array.isArray(categories)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const clean = categories.map((c) => String(c).trim()).filter(Boolean);
  if (new Set(clean.map((c) => c.toLowerCase())).size !== clean.length) {
    return NextResponse.json({ error: 'Two categories have the same name.' }, { status: 400 });
  }
  if (!clean.length) return NextResponse.json({ error: 'Keep at least one category.' }, { status: 400 });

  const db = await readDb();
  const listKey = type === 'photo' ? 'categories' : 'videoCategories';
  const itemsKey = type === 'photo' ? 'albums' : 'videos';

  for (const item of db[itemsKey]) {
    if (renames[item.category]) item.category = renames[item.category];
  }
  const stillUsed = db[itemsKey].filter((item) => !clean.includes(item.category));
  if (stillUsed.length) {
    const names = [...new Set(stillUsed.map((i) => i.category))].join(', ');
    return NextResponse.json(
      { error: `Move or delete the items in "${names}" before removing that category.` },
      { status: 400 }
    );
  }
  db[listKey] = clean;
  await writeDb(db);
  return NextResponse.json({ categories: db.categories, videoCategories: db.videoCategories });
}
