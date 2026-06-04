/**
 * EN: Users API — GET (admin list)
 *     Admin-only. Returns all users without password hashes.
 *     Used by the admin panel to manage user accounts.
 *
 * ID: API Pengguna — GET (daftar admin)
 *     Khusus admin. Mengembalikan semua pengguna tanpa password hash.
 *     Digunakan oleh panel admin untuk mengelola akun pengguna.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: GET /api/users — admin lists all users (hides passwordHash) / ID: GET /api/users — admin daftarkan semua pengguna (sembunyikan passwordHash) */
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: users });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}