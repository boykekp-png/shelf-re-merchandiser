/**
 * EN: Products API — GET (list) + POST (admin create)
 *     GET: Returns all products with their categories. Supports ?active=true filter
 *          to return only active (available-for-use) products.
 *     POST: Admin-only — creates a new product linked to a category.
 *           All products occupy exactly 1 grid slot (width is implicitly 1).
 *
 * ID: API Produk — GET (daftar) + POST (admin buat)
 *     GET: Mengembalikan semua produk dengan kategorinya. Mendukung filter ?active=true
 *          untuk hanya mengembalikan produk yang aktif (tersedia untuk digunakan).
 *     POST: Khusus admin — membuat produk baru yang terhubung ke kategori.
 *           Semua produk menempati tepat 1 slot grid (lebar implisit = 1).
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: GET /api/products — list products (optionally filter active only) */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  const where: Record<string, unknown> = {};
  if (activeOnly) where.isActive = true; // EN: Only available products / ID: Hanya produk yang tersedia

  try {
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: products });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** EN: POST /api/products — admin creates a product / ID: POST /api/products — admin membuat produk */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    // EN: Parse body; defaultWidth accepted but ignored (all products are 1-grid).
    // ID: Parse body; defaultWidth diterima tapi diabaikan (semua produk 1-grid).
    const { name, categoryId, defaultWidth, imagePath } = await request.json();
    if (!name || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const product = await prisma.product.create({
      data: { name, categoryId, imagePath: imagePath || null },
      include: { category: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}