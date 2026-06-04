import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Save/update a design with its shelves and items
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { shelves } = await request.json();
    // Delete existing items and shelves, then recreate
    await prisma.designItem.deleteMany({ where: { designShelf: { designId: params.id } } });
    await prisma.designShelf.deleteMany({ where: { designId: params.id } });

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

// DELETE - Delete a design
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.savedDesign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}