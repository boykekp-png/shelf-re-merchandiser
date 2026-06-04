/**
 * EN: Move Design Item — PUT
 *     Moves a product between shelves or to a different grid position.
 *     Updates both the shelf assignment AND the grid position atomically.
 *     Overlap prevention is handled client-side (see HomePageClient.tsx).
 *
 * ID: Pindahkan Item Desain — PUT
 *     Memindahkan produk antar rak atau ke posisi grid yang berbeda.
 *     Memperbarui penetapan rak DAN posisi grid secara atomik.
 *     Pencegahan tumpang tindih ditangani di sisi klien (lihat HomePageClient.tsx).
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: PUT /api/designs/items/:id/move — move item to new shelf/position / ID: PUT /api/designs/items/:id/move — pindahkan item ke rak/posisi baru */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { shelfId, gridPosition } = await request.json();
    await prisma.designItem.update({
      where: { id: params.id },
      data: { designShelfId: shelfId, gridPosition }, // EN: Both updated at once / ID: Keduanya diperbarui sekaligus
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}