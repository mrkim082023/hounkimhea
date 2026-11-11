import Link from 'next/link';
import { readDb } from '../lib/db';
import Reveal from '../components/Reveal';
import Hero from '../components/Hero';
import AlbumGrid from '../components/AlbumGrid';
import VideoGrid from '../components/VideoGrid';
import ClientLogos from '../components/ClientLogos';

function SectionHeader({ eyebrow, title, accent, href, linkLabel }) {
  return (
    <Reveal>
      <div className="flex items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">{eyebrow}</p>
          <h2 className="font-display text-4xl md:text-6xl mt-3 text-bone">
            {title} <span className="gold-text italic">{accent}</span>
          </h2>
        </div>
        <Link
          href={href}
          className="group hidden md:inline-flex items-center gap-2 text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300 transition-colors whitespace-nowrap"
        >
          {linkLabel}
          <span className="transition-transform duration-300 group-hover:translate-x-1">&#8594;</span>
        </Link>
      </div>
    </Reveal>
  );
}

export default async function HomePage() {
  const db = await readDb();

  // Albums / videos marked "Show on homepage" in the admin panel come first.
  const featuredAlbums = db.albums.some((a) => a.featured)
    ? db.albums.filter((a) => a.featured).slice(0, 6)
    : db.albums.slice(0, 6);

  const featuredVideos = db.videos.some((v) => v.featured)
    ? db.videos.filter((v) => v.featured).slice(0, 4)
    : (db.videoCategories || [])
        .flatMap((c) => db.videos.filter((v) => v.category === c).slice(0, 2))
        .slice(0, 4);

  return (
    <div>
      <Hero tagline={db.settings.heroTagline} subtext={db.settings.heroSubtext} />

      {featuredAlbums.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
          <SectionHeader eyebrow="Selected work" title="Recent" accent="albums" href="/photography" linkLabel="View all" />
          <AlbumGrid albums={featuredAlbums} />
          <Link href="/photography" className="md:hidden mt-10 inline-block text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300">
            View all albums &#8594;
          </Link>
        </section>
      )}

      {featuredVideos.length > 0 && (
        <section className="hairline border-t border-ink-700 bg-ink-900/40">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
            <SectionHeader eyebrow="On film" title="Featured" accent="films" href="/video" linkLabel="View all" />
            <VideoGrid videos={featuredVideos} />
            <Link href="/video" className="md:hidden mt-10 inline-block text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300">
              View all films &#8594;
            </Link>
          </div>
        </section>
      )}

      {db.clients.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-24">
          <Reveal>
            <p className="text-[11px] tracking-widest2 uppercase text-gold-400 text-center mb-10">
              Trusted by brands &amp; partners
            </p>
            <ClientLogos clients={db.clients} />
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-36 text-center">
        <Reveal>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Let&apos;s work together</p>
          <h2 className="font-display text-5xl md:text-7xl mt-3 mb-10 text-bone max-w-3xl mx-auto leading-tight">
            Have a story worth <span className="gold-text italic">capturing?</span>
          </h2>
          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-3 overflow-hidden border border-gold-400/50 px-9 py-4 text-[13px] tracking-widest uppercase text-gold-200 hover:text-ink-950 transition-colors duration-500"
          >
            <span className="absolute inset-0 -translate-x-full bg-gold-400 transition-transform duration-500 ease-silk group-hover:translate-x-0" />
            <span className="relative">Start a conversation</span>
            <span className="relative transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
