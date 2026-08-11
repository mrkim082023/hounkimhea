import Reveal from '../../components/Reveal';
import ContactForm from '../../components/ContactForm';

export const metadata = { title: 'Contact — Houn Kimhea' };

export default function ContactPage() {
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
            <div>
              <p className="text-[11px] tracking-widest uppercase text-bone/30 mb-1">Email</p>
              <p>hounkimhea11@gmail.com</p>
            </div>
            <div>
              <p className="text-[11px] tracking-widest uppercase text-bone/30 mb-1">Phone</p>
              <p>+855 85500898</p>
            </div>
            <div>
              <p className="text-[11px] tracking-widest uppercase text-bone/30 mb-1">Based in</p>
              <p>Phnom Penh, Cambodia &mdash; available worldwide</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="md:col-span-3" delay={0.15}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
