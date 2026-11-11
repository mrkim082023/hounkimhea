import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ art: db.art });
}

// Update the artist statement / intro, or the order of projects.
export async function PATCH(request) {
  const updates = await request.json().catch(() => ({}));
  const db = await readDb();
  for (const key of ['statement', 'intro', 'heading']) {
    if (key in updates) db.art[key] = String(updates[key] ?? '');
  }
  if (Array.isArray(updates.projectOrder)) {
    const byId = new Map(db.art.projects.map((p) => [p.id, p]));
    const ordered = updates.projectOrder.map((id) => byId.get(id)).filter(Boolean);
    db.art.projects = [...ordered, ...db.art.projects.filter((p) => !updates.projectOrder.includes(p.id))];
  }
  await writeDb(db);
  return NextResponse.json({ art: db.art });
}
