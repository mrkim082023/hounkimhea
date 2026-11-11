import { readDb } from '../../lib/db';
import Reveal from '../../components/Reveal';
import ContactForm from '../../components/ContactForm';

export const metadata = { title: 'Contact — Houn Kimhea' };

export default async function ContactPage() {
  const db = await readDb();
  const { settings } = db;

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-28 md:py-36">
      <div className="grid md:grid-cols-5 gap-16">
        <Reveal className="md:col-span-2">
          <p className="text-[11px] tracking-widest2 uppercase text-gold-400">Get in touch</p>
          <h1 className="font-display text-5xl mt-3 mb-8 text-bone">
            Let&apos;s tell your <span className="gold-text italic">story</span>
          </h1>
          <p className="text-bone/50 text-[15px] leading-relaxed mb-10">
            Have a date in mind or a project to discuss? Send a few details and I&apos;ll get
            back to you within a couple of days.
          </p>

          <div className="space-y-4 text-sm text-bone/60">
            {settings.contactEmail && (
              <div>
                <p className="text-[11px] tracking-widest uppercase text-bone/30 mb-1">Email</p>
                <p>{settings.contactEmail}</p>
              </div>
            )}
            {settings.contactPhone && (
              <div>
                <p className="text-[11px] tracking-widest uppercase text-bone/30 mb-1">Phone</p>
                <p>{settings.contactPhone}</p>
              </div>
            )}
            {settings.contactLocation && (
              <div>
                <p className="text-[11px] tracking-widest uppercase text-bone/30 mb-1">Based in</p>
                <p>{settings.contactLocation}</p>
              </div>
            )}
          </div>

          {settings.socialLinks && settings.socialLinks.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {settings.socialLinks
                .filter((s) => s.url)
                .map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] tracking-widest uppercase text-bone/50 hover:text-gold-300 transition-colors"
                  >
                    {s.platform} &#8599;
                  </a>
                ))}
            </div>
          )}
        </Reveal>

        <Reveal className="md:col-span-3" delay={0.15}>
          <ContactForm email={settings.contactEmail} />
        </Reveal>
      </div>
    </div>
  );
}