import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { shelfId, gridPosition } = await request.json();

    // Fetch the item being moved to get its occupiedWidth
    const movingItem = await prisma.designItem.findUnique({
      where: { id: params.id },
      select: { occupiedWidth: true },
    });
    if (!movingItem) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    // Check for overlapping items on the target shelf (excluding self)
    const existingItems = await prisma.designItem.findMany({
      where: { designShelfId: shelfId, id: { not: params.id } },
      select: { id: true, gridPosition: true, occupiedWidth: true },
    });

    const width = movingItem.occupiedWidth;
    const hasOverlap = existingItems.some((item) => {
      const itemEnd = item.gridPosition + item.occupiedWidth;
      const newEnd = gridPosition + width;
      return gridPosition < itemEnd && newEnd > item.gridPosition;
    });

    if (hasOverlap) {
      return NextResponse.json({ error: 'Position conflicts with an existing item' }, { status: 409 });
    }

    await prisma.designItem.update({
      where: { id: params.id },
      data: { designShelfId: shelfId, gridPosition },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
