/**
 * EN: Design by ID — PUT (save/update) + DELETE (remove)
 *     PUT: Saves an entire design snapshot. Deletes all existing shelves/items
 *          then recreates from the provided data (full replacement strategy).
 *     DELETE: Removes the design and cascades to all shelves and items.
 *
 * ID: Desain berdasarkan ID — PUT (simpan/perbarui) + DELETE (hapus)
 *     PUT: Menyimpan snapshot desain lengkap. Menghapus semua rak/item yang ada
 *          lalu membuat ulang dari data yang diberikan (strategi penggantian penuh).
 *     DELETE: Menghapus desain dan cascade ke semua rak dan item.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: PUT /api/designs/:id — save full design (replaces shelves & items) / ID: PUT /api/designs/:id — simpan desain lengkap (mengganti rak & item) */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { shelves } = await request.json();

    // EN: Clear existing data (full replace) / ID: Hapus data existing (penggantian penuh)
    await prisma.designItem.deleteMany({ where: { designShelf: { designId: params.id } } });
    await prisma.designShelf.deleteMany({ where: { designId: params.id } });

    // EN: Recreate shelves with items / ID: Buat ulang rak dengan item
    for (const shelf of shelves) {
      const { items, ...shelfData } = shelf;
      const created = await prisma.designShelf.create({
        data: { ...shelfData, designId: params.id },
      });
      if (items?.length) {
        for (const item of items) {
          await prisma.designItem.create({
            data: {
              designShelfId: created.id,
              productId: item.productId,
              gridPosition: item.gridPosition,
              quantity: item.quantity || 1,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

/** EN: DELETE /api/designs/:id — delete a design / ID: DELETE /api/designs/:id — hapus desain */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.savedDesign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}