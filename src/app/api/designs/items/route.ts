import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/designs/items - Add item to shelf
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
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
