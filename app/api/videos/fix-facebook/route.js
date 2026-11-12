import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../../../lib/db';
import { isFacebookShareLink, resolveFacebookLink } from '../../../../lib/facebook';

// Retries turning any saved Facebook share links into playable links.
// The admin panel calls this automatically when the Videos tab opens.
export async function POST() {
  const db = await readDb();
  const pending = db.videos.filter((v) => isFacebookShareLink(v.videoUrl));
  let fixed = 0;
  for (const v of pending) {
    const resolved = await resolveFacebookLink(v.videoUrl);
    if (resolved !== v.videoUrl) {
      v.videoUrl = resolved;
      fixed++;
    }
  }
  if (fixed) await writeDb(db);
  return NextResponse.json({ fixed, stillPending: pending.length - fixed });
}
