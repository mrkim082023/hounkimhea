import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="hairline mt-32 bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-display text-2xl text-bone">
            Houn <span className="gold-text">Kimhea</span>
          </p>
          <p className="mt-2 text-sm text-bone/50 max-w-xs">
            Photography and videography for weddings, events, and stories worth keeping.
          </p>
        </div>

        <div className="flex gap-10 text-[13px] tracking-widest uppercase text-bone/60">
          <div className="flex flex-col gap-3">
            <Link href="/photography" className="hover:text-gold-300 transition-colors">Photography</Link>
            <Link href="/video" className="hover:text-gold-300 transition-colors">Video</Link>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/clients" className="hover:text-gold-300 transition-colors">Clients</Link>
            <Link href="/contact" className="hover:text-gold-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 md:px-10 pb-8 text-xs text-bone/30">
        &copy; {new Date().getFullYear()} Houn Kimhea. All rights reserved.
      </div>
    </footer>
  );
}
