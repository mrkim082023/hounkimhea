// Lists the photos inside public/uploads/<album folder> at build time and
// writes them to data/uploads-manifest.json. Pages read that list instead of
// scanning the disk, because on Vercel the server can't see public/ at runtime.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'public', 'uploads');
const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
const manifest = {};

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const images = entries
    .filter((e) => e.isFile() && exts.includes(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (images.length) {
    const rel = path.relative(root, dir).split(path.sep).join('/');
    manifest[rel] = images;
  }
  entries.filter((e) => e.isDirectory()).forEach((e) => walk(path.join(dir, e.name)));
}

walk(root);
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'uploads-manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log(`uploads manifest: ${Object.keys(manifest).length} folders`);
