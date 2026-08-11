import { NextResponse } from 'next/server';
import { readDb, writeDb, uid } from '../../../lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json({ clients: db.clients });
}

export async function POST(request) {
  const body = await request.json();
  const { name, logo = '', quote = '' } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const db = readDb();
  const client = { id: uid(), name, logo, quote, createdAt: new Date().toISOString() };
  db.clients.unshift(client);
  writeDb(db);

  return NextResponse.json({ client }, { status: 201 });
}
