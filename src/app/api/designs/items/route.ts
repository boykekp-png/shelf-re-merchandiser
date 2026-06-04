/**
 * EN: Design Items — POST (add product to shelf)
 *     Creates a new DesignItem — places a product at a specific grid position on a shelf.
 *     All products occupy exactly 1 grid slot; occupiedWidth is accepted but ignored.
 *
 * ID: Item Desain — POST (tambah produk ke rak)
 *     Membuat DesignItem baru — menempatkan produk di posisi grid tertentu pada rak.
 *     Semua produk menempati tepat 1 slot grid; occupiedWidth diterima tapi diabaikan.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: POST /api/designs/items — add a product to a shelf / ID: POST /api/designs/items — tambah produk ke rak */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // EN: occupiedWidth accepted for backward compat but ignored (all items are 1-grid).
    // ID: occupiedWidth diterima untuk kompatibilitas mundur tapi diabaikan (semua item 1-grid).
    const { shelfId, productId, gridPosition, occupiedWidth, quantity } = await request.json();
    if (!shelfId || !productId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const item = await prisma.designItem.create({
      data: {
        designShelfId: shelfId,
        productId,
        gridPosition: gridPosition || 0,
        quantity: quantity || 1,
      },
      include: { product: { include: { category: true } } },
    });

    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}