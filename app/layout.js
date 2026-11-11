import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import SmoothScroll from '../components/SmoothScroll';
import ScrollProgress from '../components/ScrollProgress';

// Content is edited live through /admin, so every page must render fresh on
// each visit — never from a cached copy — or admin edits wouldn't show up.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
        <ScrollProgress />
        <Navbar />
        <main className="min-h-screen pt-20">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}