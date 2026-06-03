import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/designs/[id] - Update design
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { shelves } = await request.json();
    const designId = params.id;

    const design = await prisma.savedDesign.findUnique({ where: { id: designId } });
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isAdmin = (session.user as any).role === 'admin';
    if (design.userId !== (session.user as any).id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.designItem.deleteMany({ where: { designShelf: { designId } } });
    await prisma.designShelf.deleteMany({ where: { designId } });

    for (const shelf of shelves) {
      const newShelf = await prisma.designShelf.create({
        data: { name: shelf.name, position: shelf.position, designId },
      });

      for (const item of shelf.items) {
        await prisma.designItem.create({
          data: {
            designShelfId: newShelf.id,
            productId: item.productId,
            gridPosition: item.gridPosition,
            occupiedWidth: item.occupiedWidth,
            quantity: item.quantity || 1,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/designs/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const designId = params.id;
    const design = await prisma.savedDesign.findUnique({ where: { id: designId } });
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isAdmin = (session.user as any).role === 'admin';
    if (design.userId !== (session.user as any).id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.savedDesign.delete({ where: { id: designId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}