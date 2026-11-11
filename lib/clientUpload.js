'use client';

import { upload } from '@vercel/blob/client';

let blobEnabled = null;

async function isBlobEnabled() {
  if (blobEnabled === null) {
    try {
      const res = await fetch('/api/blob-upload');
      blobEnabled = Boolean((await res.json()).enabled);
    } catch {
      blobEnabled = false;
    }
  }
  return blobEnabled;
}

function safeName(name) {
  const dot = name.lastIndexOf('.');
  const ext = dot > -1 ? name.slice(dot).toLowerCase() : '';
  const base = (dot > -1 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'file'}${ext}`;
}

// Uploads one file and returns its public URL.
// Online (Vercel): goes straight to Vercel Blob cloud storage.
// On your own computer without Blob set up: saved into public/uploads.
export async function uploadFile(file, folder = 'misc') {
  if (await isBlobEnabled()) {
    const blob = await upload(`${folder}/${safeName(file.name)}`, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      multipart: file.size > 50 * 1024 * 1024,
    });
    return blob.url;
  }

  const body = new FormData();
  body.append('file', file);
  body.append('folder', folder);
  const res = await fetch('/api/upload', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed.');
  return data.url;
}
