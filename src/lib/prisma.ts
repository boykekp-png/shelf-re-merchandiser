/**
 * EN: Prisma Client Singleton
 *     Creates a single PrismaClient instance reused across the application.
 *     In development, the instance is cached on `globalThis` to survive
 *     Next.js hot-reloading (which would otherwise create excess connections).
 *
 * ID: Singleton Prisma Client
 *     Membuat satu instance PrismaClient yang digunakan ulang di seluruh aplikasi.
 *     Di development, instance di-cache di `globalThis` agar tetap hidup selama
 *     hot-reloading Next.js (yang jika tidak akan membuat koneksi berlebih).
 */

import { PrismaClient } from '@prisma/client';

// EN: Extend global to hold the cached Prisma instance.
// ID: Perluas global untuk menyimpan instance Prisma yang di-cache.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// EN: Reuse cached instance or create a new one.
// ID: Gunakan ulang instance yang di-cache atau buat yang baru.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// EN: Default export for backward compatibility with existing imports.
// ID: Default export untuk kompatibilitas mundur dengan import yang sudah ada.
export default prisma;

// EN: Store in global cache during development only.
// ID: Simpan di cache global hanya saat development.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
