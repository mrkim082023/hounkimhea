import { getSiteData } from '../../lib/db';
import Reveal from '../../components/Reveal';
import VideoGrid from '../../components/VideoGrid';

export const metadata = { title: 'Video Portfolio — Houn Kimhea' };

export default async function VideoPage() {
  const db = await getSiteData();

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36 min-h-screen">
      <Reveal>
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Films</p>
        <h1 className="font-display text-5xl md:text-7xl mt-3 mb-4 text-bone">
          Video <span className="gold-text italic">portfolio</span>
        </h1>
        <p className="text-bone/40 mb-12 text-sm">Commercial projects and short films. Press play to watch here.</p>
      </Reveal>
      <VideoGrid videos={db.videos} categories={db.videoCategories} showFilters />
    </div>
  );
}
