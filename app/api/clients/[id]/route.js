import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';

export async function DELETE(_request, { params }) {
  const db = readDb();
  const idx = db.clients.findIndex((c) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  db.clients.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
