import manifest from '../data/uploads-manifest.json';

function folderUrl(folderPath, file) {
  return encodeURI(`/uploads/${folderPath}/${file}`);
}

// All photo URLs of an album: photos from its original folder in
// public/uploads (older albums) followed by photos added in the admin panel.
export function albumPhotos(album) {
  const hidden = new Set(album.hiddenFolderPhotos || []);
  const fromFolder = album.folderPath
    ? (manifest[album.folderPath] || [])
        .filter((f) => !hidden.has(f))
        .map((f) => folderUrl(album.folderPath, f))
    : [];
  const fromAdmin = (album.photos || []).map((p) => (typeof p === 'string' ? p : p.url));
  return [...fromFolder, ...fromAdmin];
}

export function albumCover(album) {
  if (album.coverImage) return album.coverImage;
  if (album.folderPath) {
    const files = manifest[album.folderPath] || [];
    const cover = files.find((f) => f.toLowerCase().startsWith('cover.'));
    if (cover) return folderUrl(album.folderPath, cover);
  }
  return albumPhotos(album)[0] || '/placeholder.jpg';
}

// The original folder photos of an album, with whether each one is hidden.
export function folderPhotos(album) {
  if (!album.folderPath) return [];
  const hidden = new Set(album.hiddenFolderPhotos || []);
  return (manifest[album.folderPath] || []).map((file) => ({
    file,
    url: folderUrl(album.folderPath, file),
    hidden: hidden.has(file),
  }));
}
