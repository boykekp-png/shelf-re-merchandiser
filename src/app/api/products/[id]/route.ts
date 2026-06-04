/**
 * EN: Product by ID — PUT (update)
 *     Admin-only. Updates a product's name, category, active status, and image.
 *
 * ID: Produk berdasarkan ID — PUT (perbarui)
 *     Khusus admin. Memperbarui nama, kategori, status aktif, dan gambar produk.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: PUT /api/products/:id — update a product / ID: PUT /api/products/:id — perbarui produk */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, categoryId, isActive, imagePath } = await request.json();
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { name, categoryId, isActive, imagePath },
      include: { category: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}