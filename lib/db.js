import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_DB = {
  categories: [
    'Event',
    'Party',
    'Pre-Wedding',
    'Pre-graduation',
    'Documentary',
    'Products',
  ],
  videoCategories: ['Corporate Video', 'Shortfilm'],
  albums: [],
  videos: [],
  clients: [],
};

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

export function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_DB;
  }
  if (!Array.isArray(data.videoCategories) || data.videoCategories.length === 0) {
    data.videoCategories = DEFAULT_DB.videoCategories;
    writeDb(data);
  }
  return data;
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
