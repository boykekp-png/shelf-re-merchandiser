/**
 * EN: Next.js Middleware — Route Protection
 *     Runs on every matching request BEFORE the page/API renders.
 *     Three layers of protection:
 *       1. Public routes (/login, /register) — redirect to home if already logged in.
 *       2. Protected routes (everything else) — redirect to login if not authenticated.
 *       3. Admin routes (/admin/*) — redirect to home if not admin role.
 *
 * ID: Middleware Next.js — Perlindungan Rute
 *     Berjalan pada setiap request yang cocok SEBELUM halaman/API dirender.
 *     Tiga lapis perlindungan:
 *       1. Rute publik (/login, /register) — arahkan ke home jika sudah login.
 *       2. Rute terlindungi (semua lainnya) — arahkan ke login jika belum terautentikasi.
 *       3. Rute admin (/admin/*) — arahkan ke home jika bukan peran admin.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// EN: Middleware function wrapped with NextAuth's auth() — provides req.auth.
// ID: Fungsi middleware yang dibungkus dengan auth() dari NextAuth — menyediakan req.auth.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const userRole = (req.auth?.user as any)?.role;

  // ─── Public routes / Rute publik ───
  // EN: If logged in, redirect away from login/register to home.
  // ID: Jika sudah login, arahkan dari login/register ke halaman utama.
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ─── Protected routes / Rute terlindungi ───
  // EN: If not logged in, redirect to login with callbackUrl to return after auth.
  // ID: Jika belum login, arahkan ke login dengan callbackUrl untuk kembali setelah auth.
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Admin-only routes / Rute khusus admin ───
  // EN: Non-admin users are redirected to home.
  // ID: Pengguna non-admin diarahkan ke halaman utama.
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // EN: Allow the request to proceed / ID: Izinkan request untuk dilanjutkan
  return NextResponse.next();
});

// EN: Matcher config — which paths the middleware applies to.
//     Excludes API routes, static files, Next.js internals, and favicon.
// ID: Konfigurasi matcher — path mana yang diterapkan middleware.
//     Mengecualikan rute API, file statis, internal Next.js, dan favicon.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};