import { readDb } from '../../lib/db';
import Reveal from '../../components/Reveal';
import ClientLogos from '../../components/ClientLogos';

export const metadata = { title: 'Clients — Houn Kimhea' };

export default async function ClientsPage() {
  const db = await readDb();
  const withQuotes = db.clients.filter((c) => c.quote);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
      <Reveal>
        <p className="text-[11px] tracking-widest2 uppercase text-gold-400 text-center">
          Proven track record
        </p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 mb-16 text-bone text-center">
          Trusted by <span className="gold-text italic">brands & partners</span>
        </h1>
      </Reveal>

      {db.clients.length === 0 ? (
        <p className="text-bone/40 font-display text-2xl py-16 text-center">
          Client list coming soon.
        </p>
      ) : (
        <>
          <Reveal>
            <ClientLogos clients={db.clients} />
          </Reveal>

          <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-ink-700/60 border border-ink-700/60">
            {db.clients.map((client, i) => (
              <Reveal key={client.id} delay={(i % 4) * 0.06} className="bg-ink-950">
                <div className="group relative aspect-[4/3] flex flex-col items-center justify-center gap-4 p-6 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-gold-400/0 group-hover:from-gold-400/10 group-hover:to-transparent transition-all duration-700" />
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={client.name}
                      loading="lazy"
                      className="relative max-h-16 max-w-[70%] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-silk"
                    />
                  ) : (
                    <span className="relative font-display text-2xl text-bone/70">{client.name}</span>
                  )}
                  <span className="relative text-[10px] tracking-widest uppercase text-bone/30 group-hover:text-gold-300 transition-colors duration-500 text-center">
                    {client.name}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {withQuotes.length > 0 && (
            <div className="pt-20 md:pt-28">
              <Reveal>
                <p className="text-[11px] tracking-widest2 uppercase text-gold-400 mb-3 text-center">
                  Community feedback
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-bone mb-14 text-center">
                  What partners <span className="gold-text italic">say</span>
                </h2>
              </Reveal>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {withQuotes.map((client, i) => (
                  <Reveal key={client.id} delay={(i % 6) * 0.06}>
                    <div className="border border-ink-700 rounded-sm p-7 h-full flex flex-col justify-between">
                      <p className="font-display text-lg italic text-bone/80 leading-relaxed mb-5">
                        &ldquo;{client.quote}&rdquo;
                      </p>
                      <p className="text-[13px] tracking-widest uppercase text-gold-300/80">
                        {client.name}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}