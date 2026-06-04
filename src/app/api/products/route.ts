import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  const where: Record<string, unknown> = {};
  if (activeOnly) where.isActive = true;

  try {
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: products });
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
    const { name, categoryId, defaultWidth, imagePath } = await request.json();
    if (!name || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const product = await prisma.product.create({
      data: { name, categoryId, imagePath: imagePath || null },
      include: { category: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}