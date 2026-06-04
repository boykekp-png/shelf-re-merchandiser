/**
 * EN: NextAuth API Route Handler
 *     Exposes GET and POST handlers for NextAuth.js v5.
 *     All auth logic (sign in, sign out, session) is handled
 *     by the configuration in @/lib/auth.ts.
 *
 * ID: Handler Rute API NextAuth
 *     Mengekspos handler GET dan POST untuk NextAuth.js v5.
 *     Semua logika auth (masuk, keluar, sesi) ditangani
 *     oleh konfigurasi di @/lib/auth.ts.
 */

import { handlers } from '@/lib/auth';

// EN: GET = check session, POST = sign in / ID: GET = cek sesi, POST = masuk
export const { GET, POST } = handlers;