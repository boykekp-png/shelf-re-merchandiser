/**
 * EN: Design Shelf by ID — PATCH (rename) + DELETE (remove)
 *     PATCH: Renames a shelf (e.g., "Shelf 1" → "Produce Section").
 *     DELETE: Removes the shelf and cascades to all items on it.
 *
 * ID: Rak Desain berdasarkan ID — PATCH (ganti nama) + DELETE (hapus)
 *     PATCH: Mengganti nama rak (misal, "Shelf 1" → "Bagian Sayur").
 *     DELETE: Menghapus rak dan cascade ke semua item di dalamnya.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: PATCH /api/designs/shelves/:id — rename a shelf / ID: PATCH /api/designs/shelves/:id — ganti nama rak */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name } = await request.json();
    await prisma.designShelf.update({ where: { id: params.id }, data: { name } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

/** EN: DELETE /api/designs/shelves/:id — delete a shelf (cascades to items) / ID: DELETE /api/designs/shelves/:id — hapus rak (cascade ke item) */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.designShelf.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}