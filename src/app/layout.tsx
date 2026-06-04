/**
 * EN: Root Layout — wraps every page with:
 *     - Inter font (Google Fonts)
 *     - ErrorBoundary (suppresses browser extension errors)
 *     - SessionProviderWrapper (makes session available via React context)
 *     - Toaster (react-hot-toast for notifications)
 *     - Global CSS (Tailwind + custom styles)
 *
 * ID: Layout Root — membungkus setiap halaman dengan:
 *     - Font Inter (Google Fonts)
 *     - ErrorBoundary (menekan error ekstensi browser)
 *     - SessionProviderWrapper (membuat sesi tersedia via React context)
 *     - Toaster (react-hot-toast untuk notifikasi)
 *     - CSS Global (Tailwind + gaya kustom)
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shelf Re‑merchandiser',
  description: 'Modern shelf management and product placement tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* EN: Catch extension errors before they crash the app / ID: Tangkap error ekstensi sebelum merusak aplikasi */}
        <ErrorBoundary>
          {/* EN: Provide session context to all children / ID: Menyediakan konteks sesi ke semua children */}
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </ErrorBoundary>
        {/* EN: Toast notifications at top-right, auto-dismiss after 3s / ID: Notifikasi toast di kanan atas, hilang otomatis setelah 3 detik */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}