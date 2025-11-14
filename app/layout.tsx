// app/layout.tsx
import type { Metadata } from 'next';
import ClientProviders from '@/components/ClientProvider';
import { Inter } from 'next/font/google';
import ScrollToTop from '@/components/generals/scrollToTop';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import './globals.css';
const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'The-handiscraft - Online Grocery Store',
  description:
    'The-handiscraft is an online grocery store that offers a wide range of fresh and high-quality products at competitive prices. Shop with us for a convenient and enjoyable grocery shopping experience.',
  keywords:
    'online grocery store, fresh groceries, quality products, competitive prices, convenient shopping, grocery delivery, organic produce, household essentials',
  // authors: [{ name: 'The-handiscraft', url: 'https://the-handiscraft.vercel.app' }],
  themeColor: '#ffffff',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-primary-lightest antialiased`}>
        <ScrollToTop />
        <ReactQueryProvider>
          <ClientProviders>{children}</ClientProviders>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
