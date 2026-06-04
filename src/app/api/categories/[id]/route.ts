/**
 * EN: Category by ID — PUT (update) + DELETE (remove)
 *     Admin-only endpoints for managing individual categories.
 *
 * ID: Kategori berdasarkan ID — PUT (perbarui) + DELETE (hapus)
 *     Endpoint khusus admin untuk mengelola kategori individual.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: PUT /api/categories/:id — update a category / ID: PUT /api/categories/:id — perbarui kategori */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, icon, color } = await request.json();
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, icon, color },
    });
    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

/** EN: DELETE /api/categories/:id — delete a category / ID: DELETE /api/categories/:id — hapus kategori */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}