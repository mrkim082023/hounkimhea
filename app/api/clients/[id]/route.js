import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';
import { deleteBlobs } from '../../../../lib/blobDelete';

export async function DELETE(_request, { params }) {
  const db = await readDb();
  const idx = db.clients.findIndex((c) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  const [removed] = db.clients.splice(idx, 1);
  await writeDb(db);
  await deleteBlobs([removed.logo]);
  return NextResponse.json({ ok: true });
}
