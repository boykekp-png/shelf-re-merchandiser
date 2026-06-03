import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, icon, color } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const category = await prisma.category.create({ data: { name, icon: icon || '📦', color: color || '#9E9E9E' } });
    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}