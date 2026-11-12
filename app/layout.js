import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import SmoothScroll from '../components/SmoothScroll';
import ScrollProgress from '../components/ScrollProgress';
import NavProgress from '../components/NavProgress';

// Pages are prepared ahead of time so they open instantly. Whenever something
// is saved in /admin, they are rebuilt automatically (see lib/db.js).
export const revalidate = 3600;

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
        <NavProgress />
        <Navbar />
        <main className="min-h-screen pt-20">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}