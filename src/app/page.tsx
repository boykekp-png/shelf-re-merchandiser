/**
 * EN: Home Page (/) — root route of the application.
 *     This is a thin Server Component wrapper that delegates
 *     all interactivity to HomePageClient (a Client Component).
 *     Using force-dynamic ensures the page is never statically cached
 *     since it depends on authentication state.
 *
 * ID: Halaman Utama (/) — rute root aplikasi.
 *     Ini adalah Server Component pembungkus tipis yang mendelegasikan
 *     semua interaktivitas ke HomePageClient (Client Component).
 *     Menggunakan force-dynamic memastikan halaman tidak pernah di-cache statis
 *     karena bergantung pada status autentikasi.
 */

export const dynamic = 'force-dynamic';

import HomePageClient from './HomePageClient';

export default function Page() {
  return <HomePageClient />;
}