import Link from 'next/link';
import { readDb } from '../lib/db';
import Reveal from '../components/Reveal';
import Hero from '../components/Hero';
import AlbumGrid from '../components/AlbumGrid';
import ClientLogos from '../components/ClientLogos';
function slugify(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^m\./, '').replace(/^www\./, '');

    if (host === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const segments = u.pathname.split('/').filter(Boolean);
      const knownPrefixes = ['shorts', 'embed', 'live'];
      const prefixIndex = segments.findIndex((s) => knownPrefixes.includes(s));
      if (prefixIndex !== -1 && segments[prefixIndex + 1]) {
        return segments[prefixIndex + 1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

function thumbnailFor(video) {
  if (video.thumbnail) return video.thumbnail;
  const id = extractYouTubeId(video.videoUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export default async function HomePage() {
  const db = await readDb();
  const featured = db.albums.slice(0, 6);

  // Feature the latest couple of videos from each video category
  // (Corporate Video, Shortfilm), most recent first, capped at 4 total.
  const featuredVideos = (db.videoCategories || [])
    .flatMap((category) => db.videos.filter((v) => v.category === category).slice(0, 2))
    .slice(0, 4);

  return (
    <div>
     <Hero tagline={db.settings.heroTagline} subtext={db.settings.heroSubtext} />

      <section className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
        <Reveal>
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Selected work</p>
              <h2 className="font-display text-4xl md:text-5xl mt-3 text-bone">
                Recent <span className="gold-text italic">albums</span>
              </h2>
            </div>
            <Link
              href="/photography"
              className="hidden md:inline text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300 transition-colors whitespace-nowrap"
            >
              View all &#8594;
            </Link>
          </div>
        </Reveal>

        <AlbumGrid
          albums={featured}
          categorySlug={featured[0] ? slugify(featured[0].category) : ''}
        />
        {featured.length > 0 && (
          <p className="mt-10 text-xs text-bone/30 md:hidden">
            Note: each album links back to its own category page.
          </p>
        )}
      </section>

      {featuredVideos.length > 0 && (
        <section className="hairline border-t border-ink-700 bg-ink-900/40">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32">
            <Reveal>
              <div className="flex items-end justify-between gap-6 mb-12">
                <div>
                  <p className="text-[11px] tracking-widest2 uppercase text-gold-400">On film</p>
                  <h2 className="font-display text-4xl md:text-5xl mt-3 text-bone">
                    Featured <span className="gold-text italic">films</span>
                  </h2>
                </div>
                <Link
                  href="/video"
                  className="hidden md:inline text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300 transition-colors whitespace-nowrap"
                >
                  View all &#8594;
                </Link>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              {featuredVideos.map((video, i) => {
                const thumb = thumbnailFor(video);
                return (
                  <Reveal key={video.id} delay={i * 0.08}>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative overflow-hidden rounded-sm aspect-video bg-ink-800"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={video.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 grain" />
                      )}
                      <div className="absolute inset-0 bg-ink-950/40 group-hover:bg-ink-950/20 transition-colors duration-500 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-gold-300/70 flex items-center justify-center backdrop-blur-sm bg-ink-950/30 group-hover:scale-110 transition-transform duration-500 ease-silk">
                          <div className="w-0 h-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-gold-300 ml-1" />
                        </div>
                      </div>
                      <div className="absolute left-5 bottom-5 right-5">
                        <p className="text-[10px] tracking-widest2 uppercase text-gold-300/80">
                          {video.category}
                        </p>
                        <p className="font-display text-xl text-bone mt-1">{video.title}</p>
                      </div>
                    </a>
                  </Reveal>
                );
              })}
            </div>

            <Link
              href="/video"
              className="md:hidden mt-10 inline-block text-[13px] tracking-widest uppercase text-bone/60 hover:text-gold-300 transition-colors"
            >
              View all films &#8594;
            </Link>
          </div>
        </section>
      )}
{db.clients.length > 0 && (
  <section className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-20">
    <Reveal>
      <p className="text-[11px] tracking-widest2 uppercase text-gold-400 text-center mb-10">
        Trusted by brands &amp; partners
      </p>
      <ClientLogos clients={db.clients} />
    </Reveal>
  </section>
)}
      <section className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32 text-center">
        <Reveal>
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Let&apos;s work together</p>
          <h2 className="font-display text-4xl md:text-6xl mt-3 mb-8 text-bone max-w-3xl mx-auto leading-tight">
            Have a story worth <span className="gold-text italic">capturing?</span>
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 border border-gold-400/50 px-8 py-4 text-[13px] tracking-widest uppercase text-gold-200 hover:bg-gold-400 hover:text-ink-950 transition-colors duration-400"
          >
            Start a conversation
          </Link>
        </Reveal>
      </section>
    </div>
  );
}