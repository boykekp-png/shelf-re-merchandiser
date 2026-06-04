/**
 * EN: Categories API — GET (list all) + POST (admin create)
 *     GET: Returns all categories with product counts, ordered by name.
 *     POST: Admin-only — creates a new category with icon and color.
 *
 * ID: API Kategori — GET (daftar semua) + POST (admin buat)
 *     GET: Mengembalikan semua kategori dengan jumlah produk, diurutkan berdasarkan nama.
 *     POST: Khusus admin — membuat kategori baru dengan ikon dan warna.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: GET /api/categories — list all categories / ID: GET /api/categories — daftar semua kategori */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** EN: POST /api/categories — admin creates a category / ID: POST /api/categories — admin membuat kategori */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, icon, color } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const category = await prisma.category.create({ data: { name, icon: icon || '📦', color: color || '#9E9E9E' } });
    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}