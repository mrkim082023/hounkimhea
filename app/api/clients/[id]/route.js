import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';
import { deleteBlobs } from '../../../../lib/blobDelete';

export async function PATCH(request, { params }) {
  const updates = await request.json();
  const db = await readDb();
  const client = db.clients.find((c) => c.id === params.id);
  if (!client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });

  const oldLogo = client.logo;
  for (const key of ['name', 'logo', 'quote', 'website']) {
    if (key in updates) client[key] = updates[key];
  }
  if (!client.name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  await writeDb(db);
  if (oldLogo && oldLogo !== client.logo) await deleteBlobs([oldLogo]);
  return NextResponse.json({ client });
}

export async function DELETE(_request, { params }) {
  const db = await readDb();
  const idx = db.clients.findIndex((c) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  const [removed] = db.clients.splice(idx, 1);
  await writeDb(db);
  await deleteBlobs([removed.logo]);
  return NextResponse.json({ ok: true });
}
