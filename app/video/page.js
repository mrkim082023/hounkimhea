import { readDb } from '../../lib/db';

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch {
    return null;
  }
  return null;
}

export const metadata = { title: 'Video Portfolio — Houn Kimhea' };

export default function VideoPage() {
  const db = readDb();
  const videoList = db.videos;

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36 text-bone min-h-screen">
      <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Films</p>
      <h1 className="font-display text-5xl md:text-6xl mt-3 mb-4 text-bone">
        Video <span className="gold-text italic">portfolio</span>
      </h1>
      <p className="text-bone/40 mb-16 text-sm">Watch our commercial projects and short films</p>
      {videoList.length === 0 ? (
        <p className="text-bone/40 font-display text-2xl py-16 text-center">
          No films published yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videoList.map((video) => {
            const isFb = !!video.isFacebook;
            const youtubeId = !isFb ? extractYouTubeId(video.videoUrl) : null;

            const thumbnailSrc =
              video.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

            return (
              <div
                key={video.id}
                className="rounded-sm overflow-hidden shadow-md bg-ink-900 border border-ink-700 p-4 flex flex-col justify-between group hover:border-gold-400/40 transition-all duration-300"
              >
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video w-full bg-ink-800 rounded-sm flex flex-col items-center justify-center relative overflow-hidden shadow-inner border border-ink-700"
                >
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                    />
                  ) : (
                    <div className="absolute inset-0 grain" />
                  )}

                  <div className="absolute inset-0 bg-ink-950/40 group-hover:bg-ink-950/20 transition-colors" />

                  <div className="relative z-10 w-16 h-16 rounded-full bg-gold-400 text-ink-950 flex items-center justify-center font-bold text-2xl shadow-lg group-hover:bg-gold-300 group-hover:scale-110 transition-all duration-300">
                    &#9654;
                  </div>

                  <span className="relative z-10 text-[11px] text-bone/80 mt-3 bg-ink-950/70 px-3 py-1 rounded-full backdrop-blur-sm tracking-widest uppercase font-semibold">
                    {isFb ? 'Watch on Facebook ↗' : 'Watch on YouTube ↗'}
                  </span>
                </a>

                <div className="mt-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold tracking-widest2 text-gold-400 uppercase">
                      {video.category}
                    </span>
                    <h3 className="text-xl font-display mt-1 text-bone group-hover:text-gold-300 transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-bone/50 mt-2 line-clamp-2">{video.description}</p>
                    )}
                  </div>

                  <div className="mt-5">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2.5 bg-ink-800 hover:bg-gold-400 hover:text-ink-950 text-bone text-xs font-bold uppercase rounded-sm transition-all text-center w-full border border-ink-700 hover:border-gold-400 tracking-widest"
                    >
                      Open External Video Player ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}