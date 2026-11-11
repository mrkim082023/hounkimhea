import { del } from '@vercel/blob';

// Removes files from Vercel Blob cloud storage. Files that live in
// public/uploads (part of the site's code) are left alone.
export async function deleteBlobs(urls) {
  const blobUrls = urls.filter((u) => typeof u === 'string' && u.includes('.blob.vercel-storage.com'));
  if (!blobUrls.length || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(blobUrls);
  } catch (e) {
    console.error('Could not delete blob files:', e);
  }
}
