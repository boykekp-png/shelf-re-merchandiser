import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Update category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, icon, color } = await request.json();
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, icon, color },
    });
    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

// DELETE - Delete category
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}