import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, categoryId, defaultWidth, isActive, imagePath } = await request.json();
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { name, categoryId, defaultWidth, isActive, imagePath },
      include: { category: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}