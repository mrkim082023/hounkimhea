import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { unstable_noStore as noStore, unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import seedData from '../data/db.json';

// Where the site's content lives:
// - On Vercel: in the Neon Postgres database (DATABASE_URL), as one JSON document.
// - On your own computer without DATABASE_URL: in data/db.json, as before.
// The first time the database is used it is filled from data/db.json, so the
// albums, videos and clients already in that file carry over automatically.
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const ROW_ID = 'site';

const DEFAULT_SETTINGS = {
  heroTagline: 'Photography & Filmmaking — Cambodia & beyond',
  heroSubtext:
    "I photograph and film the moments people want to keep — weddings, events, and documentary stories, shot with patience and a quiet eye for light.",
  aboutIntro:
    "I'm Houn Kimhea, a photographer and filmmaker based in Cambodia, telling stories one frame at a time.",
  aboutBio:
    "For me, a camera has never just been a tool — it's a way of paying attention. I got my start photographing friends' celebrations, and what began as a hobby turned into a practice built on patience, timing, and an eye for the light that makes an ordinary moment feel unforgettable.\n\nToday I split my time between photography and film, moving between weddings, corporate events, and quiet documentary work. Whether I'm behind a camera at a wedding reception or directing a short brand film, the goal is the same: capture something true, not staged.\n\nWhen I'm not shooting, I'm usually editing late into the night, scouting new locations, or studying the work of photographers and directors I admire — always looking for the next way to see something familiar differently.",
  aboutPhoto: '/about-me.jpg',
  skills: [
    'Wedding & pre-wedding photography',
    'Event & documentary coverage',
    'Cinematic videography',
    'Studio & product photography',
    'Photo & video editing / color grading',
  ],
  achievements: [
    { year: '2025', title: 'Won Fujifilm National Photography Award', detail: '1st Place Winner' },
    { year: '2025', title: 'Won Smart Phone Photography Contest', detail: '3rd Runner Up' },
    { year: '2025', title: "Finished Art Photography — Nimith Art Space", detail: "Art Project: 'Unquieted End'" },
    { year: '2024', title: "Exhibition 'New Wave' — F3 Gallery", detail: 'Phnom Penh, Cambodia' },
    { year: '2024', title: 'Won Oppo Smart Phone Photography Contest', detail: '5th Place' },
    { year: '2024', title: 'Graduate — Nimith Art Space', detail: 'Basic Art Photography' },
    { year: '2024', title: 'Graduate — Professional Institute of Cambodia', detail: 'Short Filmmaking' },
  ],
  contactEmail: 'hounkimhea11@gmail.com',
  contactPhone: '',
  contactLocation: 'Phnom Penh, Cambodia — available worldwide',
  socialLinks: [],
};

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
  settings: DEFAULT_SETTINGS,
};

let sqlClient = null;
let tableReady = null;

function sql() {
  if (!sqlClient) sqlClient = neon(DATABASE_URL, { fetchOptions: { cache: 'no-store' } });
  return sqlClient;
}

async function ensureTable() {
  if (!tableReady) {
    tableReady = sql()`CREATE TABLE IF NOT EXISTS site_content (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`.catch((e) => {
      tableReady = null;
      throw e;
    });
  }
  return tableReady;
}

// Facebook share links already saved before automatic conversion existed.
const KNOWN_FACEBOOK_LINKS = {
  'https://www.facebook.com/share/v/18JfCKEpJc/': 'https://www.facebook.com/reel/3471241919724287',
  'https://www.facebook.com/share/v/1E7CghLULf/': 'https://www.facebook.com/reel/1728371797827361',
  'https://www.facebook.com/share/v/1JNrimLemu/': 'https://www.facebook.com/reel/1419708656052602',
  'https://www.facebook.com/share/v/1FeLRM8mWr/': 'https://www.facebook.com/reel/1140729221291971',
  'https://www.facebook.com/share/v/1A9o4a5RxH/': 'https://www.facebook.com/reel/534412975833063',
  'https://www.facebook.com/share/r/1EYYn1eEyQ/': 'https://www.facebook.com/reel/2540741053011926',
  'https://www.facebook.com/share/r/1Mc4zsBmSF/': 'https://www.facebook.com/reel/1643757656907928',
  'https://www.facebook.com/share/r/19pesQvWqV/': 'https://www.facebook.com/reel/4381540552102715',
  'https://www.facebook.com/share/v/1H8kNASqyQ/': 'https://www.facebook.com/reel/999806675930458',
};

function withDefaults(data) {
  let changed = false;
  const out = { ...DEFAULT_DB, ...data };
  if (!Array.isArray(out.categories) || out.categories.length === 0) {
    out.categories = DEFAULT_DB.categories;
    changed = true;
  }
  if (!Array.isArray(out.videoCategories) || out.videoCategories.length === 0) {
    out.videoCategories = DEFAULT_DB.videoCategories;
    changed = true;
  }
  for (const key of ['albums', 'videos', 'clients']) {
    if (!Array.isArray(out[key])) {
      out[key] = [];
      changed = true;
    }
  }
  out.albums = out.albums.map((a) => (Array.isArray(a.photos) ? a : { ...a, photos: [] }));
  out.videos = out.videos.map((v) => {
    if (KNOWN_FACEBOOK_LINKS[v.videoUrl]) {
      changed = true;
      return { ...v, videoUrl: KNOWN_FACEBOOK_LINKS[v.videoUrl] };
    }
    return v;
  });
  if (!out.art || typeof out.art !== 'object') {
    out.art = { statement: '', intro: '', projects: [] };
    changed = true;
  }
  if (!Array.isArray(out.art.projects)) out.art.projects = [];
  if (!out.settings || typeof out.settings !== 'object') {
    out.settings = { ...DEFAULT_SETTINGS };
    changed = true;
  } else {
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (!(key in out.settings)) {
        out.settings[key] = DEFAULT_SETTINGS[key];
        changed = true;
      }
    }
  }
  return { data: out, changed };
}

function readFileDb() {
  if (!fs.existsSync(DB_PATH)) return JSON.parse(JSON.stringify(seedData));
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return JSON.parse(JSON.stringify(seedData));
  }
}

async function readCore({ persistMigrations }) {
  if (!DATABASE_URL) {
    const { data, changed } = withDefaults(readFileDb());
    if (changed && persistMigrations) await writeDb(data);
    return data;
  }

  await ensureTable();
  const rows = await sql()`SELECT data FROM site_content WHERE id = ${ROW_ID}`;
  if (rows.length === 0) {
    const { data } = withDefaults(JSON.parse(JSON.stringify(seedData)));
    if (persistMigrations) await writeDb(data);
    return data;
  }
  const { data, changed } = withDefaults(rows[0].data);
  if (changed && persistMigrations) await writeDb(data);
  return data;
}

// Fresh read straight from the database. Used by the admin API, which edits content.
export async function readDb() {
  noStore();
  return readCore({ persistMigrations: true });
}

// Read for the public pages. The result is kept ready (cached) so pages open
// instantly, and it is refreshed automatically every time anything is saved in
// the admin panel (see writeDb), so visitors always see the latest content.
export const getSiteData = unstable_cache(() => readCore({ persistMigrations: false }), ['site-data-v1'], {
  tags: ['site-data'],
  revalidate: 3600,
});

export async function writeDb(data) {
  if (!DATABASE_URL) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    refreshPages();
    return;
  }
  await ensureTable();
  await sql()`INSERT INTO site_content (id, data, updated_at)
    VALUES (${ROW_ID}, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
  refreshPages();
}

// Tell the site that content changed, so every page shows the new version.
function refreshPages() {
  try {
    revalidateTag('site-data');
    revalidatePath('/', 'layout');
  } catch {
    // Not inside a request (e.g. during a build) — nothing to refresh.
  }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
