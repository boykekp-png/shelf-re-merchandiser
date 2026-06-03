import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH - Update item quantity
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

// DELETE - Remove item from shelf
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