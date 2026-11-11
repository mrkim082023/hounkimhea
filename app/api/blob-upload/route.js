import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';

// The admin panel uploads photos and videos straight from the browser to
// Vercel Blob (so big files don't hit Vercel's 4.5MB request limit). This route
// only hands out short-lived upload permissions; middleware.js makes sure the
// person asking is logged in as admin.

const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Cloud storage is not connected (BLOB_READ_WRITE_TOKEN is missing).' },
      { status: 500 }
    );
  }
  const body = await request.json();
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Upload failed.' }, { status: 400 });
  }
}
