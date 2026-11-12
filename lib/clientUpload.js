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

// Shrinks big photos in the browser before uploading (max 2400px, good-quality
// JPEG), so uploads are quick and the site stays fast. Logos and small images
// are left untouched.
// iPhone photos (HEIC) can't be shown by most browsers, so turn them into JPG first.
async function convertHeic(file) {
  const isHeic = /image\/hei(c|f)/i.test(file.type) || /\.hei(c|f)$/i.test(file.name);
  if (!isHeic) return file;
  try {
    const heic2any = (await import('heic2any')).default;
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(out) ? out[0] : out;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {
    throw new Error(`Couldn't convert the iPhone photo “${file.name}”. Please save it as JPG and try again.`);
  }
}

async function compressPhoto(file) {
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return file;
  if (file.size < 1.2 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

// Uploads one file and returns its public URL.
// Online (Vercel): goes straight to Vercel Blob cloud storage.
// On your own computer without Blob set up: saved into public/uploads.
export async function uploadFile(file, folder = 'misc', { compress = folder !== 'clients' } = {}) {
  file = await convertHeic(file);
  if (compress) file = await compressPhoto(file);
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
