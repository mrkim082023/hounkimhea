import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../lib/db';

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ settings: db.settings });
}

export async function PATCH(request) {
  const updates = await request.json();
  const db = await readDb();

  const editable = [
    'heroTagline',
    'heroSubtext',
    'aboutIntro',
    'aboutBio',
    'aboutPhoto',
    'skills',
    'achievements',
    'contactEmail',
    'contactPhone',
    'contactLocation',
    'socialLinks',
  ];

  for (const key of editable) {
    if (key in updates) db.settings[key] = updates[key];
  }

  await writeDb(db);
  return NextResponse.json({ settings: db.settings });
}