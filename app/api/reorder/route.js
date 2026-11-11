import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

// Saves a new order for albums, videos or clients (the order they show on the site).
export async function POST(request) {
  const { collection, ids } = await request.json().catch(() => ({}));
  if (!['albums', 'videos', 'clients'].includes(collection) || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'Invalid reorder request.' }, { status: 400 });
  }
  const db = await readDb();
  const byId = new Map(db[collection].map((item) => [item.id, item]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  // Keep anything not mentioned (e.g. added meanwhile) at the end.
  const rest = db[collection].filter((item) => !ids.includes(item.id));
  db[collection] = [...ordered, ...rest];
  await writeDb(db);
  return NextResponse.json({ ok: true, [collection]: db[collection] });
}
