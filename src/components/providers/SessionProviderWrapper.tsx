/**
 * EN: SessionProviderWrapper — Wraps children with NextAuth SessionProvider.
 *     Must be a client component since SessionProvider uses React Context.
 *     Used in the root layout to make session data available throughout the app.
 *
 * ID: SessionProviderWrapper — Membungkus children dengan SessionProvider NextAuth.
 *     Harus komponen client karena SessionProvider menggunakan React Context.
 *     Digunakan di layout root untuk membuat data sesi tersedia di seluruh aplikasi.
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}