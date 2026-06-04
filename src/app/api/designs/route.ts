/**
 * EN: Designs API — GET (list) + POST (create)
 *     GET: Lists saved designs. Admin sees all designs; regular users see only their own.
 *     POST: Creates a new design for the current user.
 *
 * ID: API Desain — GET (daftar) + POST (buat)
 *     GET: Mendaftar desain yang tersimpan. Admin melihat semua desain; pengguna biasa hanya melihat miliknya.
 *     POST: Membuat desain baru untuk pengguna saat ini.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: GET /api/designs — list designs (all for admin, own for users) / ID: GET /api/designs — daftar desain (semua untuk admin, milik sendiri untuk user) */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  try {
    const designs = await prisma.savedDesign.findMany({
      where: isAdmin ? {} : { userId }, // EN: Admin sees all / ID: Admin melihat semua
      include: { _count: { select: { shelves: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: designs });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** EN: POST /api/designs — create a new design / ID: POST /api/designs — buat desain baru */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const design = await prisma.savedDesign.create({
      data: { name, description: description || null, userId },
    });

    return NextResponse.json({ success: true, data: design });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}