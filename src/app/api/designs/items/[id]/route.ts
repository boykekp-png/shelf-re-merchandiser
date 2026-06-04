/**
 * EN: Design Item by ID — PATCH (update quantity) + DELETE (remove from shelf)
 *     PATCH: Updates the quantity of a product at its shelf position.
 *     DELETE: Removes the product from the shelf entirely.
 *
 * ID: Item Desain berdasarkan ID — PATCH (perbarui jumlah) + DELETE (hapus dari rak)
 *     PATCH: Memperbarui jumlah produk di posisi raknya.
 *     DELETE: Menghapus produk dari rak sepenuhnya.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: PATCH /api/designs/items/:id — update quantity / ID: PATCH /api/designs/items/:id — perbarui jumlah */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { quantity } = await request.json();
    const item = await prisma.designItem.update({ where: { id: params.id }, data: { quantity } });
    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

/** EN: DELETE /api/designs/items/:id — remove item from shelf / ID: DELETE /api/designs/items/:id — hapus item dari rak */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.designItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}