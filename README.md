# Houn Kimhea — Photography &amp; Videography Portfolio

A full portfolio site with a built-in admin panel, built with Next.js, Tailwind CSS,
and Framer Motion. Golden-on-black theme, smooth scroll and page animations, fully
responsive.

## What's inside

- **Public site**: Home, About, Photography (category → album → photo gallery with
  lightbox), Video (Corporate Video / Shortfilm categories, YouTube / Facebook /
  Vimeo embeds or direct uploads), Clients, Contact
- **Admin panel** at `/admin`: create photography albums inside any category, upload
  photos into them, add videos (by link or file upload) into Corporate Video or
  Shortfilm, and manage the Clients list — no code required
- Photos and video files you upload are stored in `public/uploads/`, and all content
  (albums, photos, videos, clients) is stored in `data/db.json`

## Running it locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The admin panel is at `http://localhost:3000/admin`.

**Default admin login** (set in `.env.local`):
- Username: `kimhea`
- Password: `changeme123`

**Change these before you put the site online.** Open `.env.local` and set your own
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a long random `ADMIN_SECRET` (used to sign the
admin login session).

## Using the admin panel

1. Go to `/admin` and sign in.
2. **Photography albums** tab: pick a category (e.g. Pre-Wedding), give the album a
   title (e.g. the couple's names), and create it. Open the album with "Manage" to
   upload as many photos into it as you like. Repeat for each couple/event — a
   category can hold as many albums as you want.
3. **Video** tab: choose Corporate Video or Shortfilm, then either paste a YouTube,
   Facebook, or Vimeo link, or upload a video file directly. You can also attach a
   thumbnail image.
4. **Clients** tab: add client names, logos, and quotes for the Clients page.

Everything you add shows up on the public site immediately — no rebuild needed.

## Editing the About page text

The About page currently has placeholder biography text (I wasn't able to pull the
real copy from your reference site since it's a JavaScript-rendered page). Edit it
directly in `app/about/page.js`, or share the real text with me and I'll drop it in.

## Deploying it

This app writes uploaded files and `data/db.json` to the local disk, so it needs a
host with **persistent, writable storage** — a real server or VPS, not a serverless
platform with an ephemeral filesystem (plain Vercel/Netlify deployments will lose
uploads on every deploy).

Good options:
- **A VPS or small cloud server** (DigitalOcean, Railway, Render, a Hetzner box,
  etc.): run `npm run build && npm run start`, put it behind Nginx/Caddy with HTTPS,
  and keep the app directory (especially `data/` and `public/uploads/`) on persistent
  disk.
- **Vercel**, if you'd like to stay on it: swap the JSON-file storage for a real
  database (e.g. Vercel Postgres or Supabase) and image storage for Vercel Blob or
  Cloudinary. I'm happy to help wire this up if you'd like to deploy there.

## Project structure

```
app/                    pages and API routes (Next.js App Router)
  photography/          category → album → photo gallery pages
  video/                category → video grid pages
  admin/                login + dashboard
  api/                  albums, photos, videos, clients, auth, upload
components/             shared UI (Navbar, Hero, Lightbox, etc.)
components/admin/       admin dashboard forms
lib/                    data store (db.json reader/writer) and auth
data/db.json            all content — albums, videos, clients
public/uploads/         uploaded photos, videos, thumbnails, logos
```
