import { readDb } from '../../lib/db';
import Reveal from '../../components/Reveal';
import ClientLogos from '../../components/ClientLogos';

export const metadata = { title: 'Clients — Houn Kimhea' };

export default function ClientsPage() {
  const db = readDb();
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