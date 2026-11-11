import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import SmoothScroll from '../components/SmoothScroll';

// This site's content lives in a JSON file edited through /admin, not a
// real database — Next.js can't know that file changes, so without this
// it would cache pages at build time and admin edits wouldn't show up
// until a rebuild. This forces every page to render fresh per request.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Houn Kimhea — Photography & Videography',
  description:
    'Houn Kimhea is a photographer and filmmaker capturing events, weddings, and stories with a documentary eye.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-ink-950 text-bone antialiased">
        <SmoothScroll />
        <Navbar />
        <main className="min-h-screen pt-20">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}