import type { Metadata } from 'next';
import { Cinzel, Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['600', '700', '800', '900'],
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tarih Muhabiri - Tarihî Belge Araştırması, Röportaj ve Gazete Yayını',
  description: 'Tarih dersleri için birincil belgelere dayalı röportaj, 1919 dönemi gazete sayfası ve sesli podcast hazırlama uygulaması.',
  openGraph: {
    title: 'Tarih Muhabiri',
    description: 'Tarih dersleri için birincil belgelere dayalı röportaj, 1919 dönemi gazete sayfası ve sesli podcast hazırlama uygulaması.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarih Muhabiri',
    description: 'Tarih dersleri için birincil belgelere dayalı röportaj, 1919 dönemi gazete sayfası ve sesli podcast hazırlama uygulaması.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${cinzel.variable} ${newsreader.variable} ${plusJakartaSans.variable}`}
    >
      <body suppressHydrationWarning className="bg-[#f7f4ec] text-[#2c221e] antialiased selection:bg-[#c9a66b]/30">
        <AuthProvider>
          <AuthModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
